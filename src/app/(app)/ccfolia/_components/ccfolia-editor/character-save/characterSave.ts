import { atom, type Getter } from 'jotai';

import { meLoadingAtom } from '@/features/account/firebase/accountStore';
import {
  CcfoliaCharacterConflictError,
  CcfoliaCharacterLimitError,
  CcfoliaCharacterNotFoundError,
  createCcfoliaCharacterAtom,
  updateCcfoliaCharacterAtom,
} from '@/features/ccfolia/firebase/mutations';
import {
  type CcfoliaCharacterData,
  type CcfoliaEditorCharacter,
  CcfoliaCharacterTooLargeError,
  toCcfoliaCharacterData,
  toCcfoliaEditorCharacter,
} from '@/features/ccfolia/model';
import { toast } from '@/shared/components/ui/use-toast';
import { authUserAtom } from '@/shared/lib/firebase/useFirebaseAuth';
import { captureClientException } from '@/shared/lib/sentryClient';
import { sendGoogleAnalyticsEvent } from '@/shared/lib/useGoogleAnalytics';

import { editorContentVersionAtom, formPortAtom, formSnapshotAtom } from '../character-form/editorForm';
import {
  hasUnsavedChangesAtom,
  remoteConflictAtom,
  canCreateSavedCharacterAtom,
  selectionAtom,
} from '../saved-characters/savedCharacters';
import {
  type SaveIntent,
  type SaveOperation,
  saveFeedbackKey,
  saveOperationKey,
  savingOperationsAtom,
  successfulSaveFeedbacksAtom,
} from './saveOperation';

export type { SaveIntent } from './saveOperation';

const createSavedEditorBaseline = (
  data: CcfoliaCharacterData,
  submittedEditor: CcfoliaEditorCharacter,
): CcfoliaEditorCharacter => {
  const baseline = toCcfoliaEditorCharacter(data);
  return {
    ...baseline,
    status: baseline.status.map((status, index) => ({
      ...status,
      key: submittedEditor.status[index]?.key ?? status.key,
    })),
    params: baseline.params.map((param, index) => ({
      ...param,
      key: submittedEditor.params[index]?.key ?? param.key,
    })),
  };
};

const editorValuesMatch = (left: CcfoliaEditorCharacter, right: CcfoliaEditorCharacter) =>
  JSON.stringify(left) === JSON.stringify(right);

export const reportInvalidEditor = () => {
  toast({
    title: '入力内容を保存できません',
    description: 'カラーコードなど、入力形式が正しいか確認してください。',
    variant: 'destructive',
  });
};

const canSubmitCharacter = (get: Getter) => {
  const uid = get(authUserAtom)?.uid ?? null;
  const form = get(formSnapshotAtom);
  const accountLoading = get(meLoadingAtom);
  return uid !== null && !accountLoading && form.characterName.trim() !== '';
};

export const canCreateCharacterFromEditorAtom = atom(
  (get) => canSubmitCharacter(get) && get(canCreateSavedCharacterAtom),
);

export const canOverwriteSelectedCharacterAtom = atom((get) => {
  const selection = get(selectionAtom);
  const hasUnsavedChanges = get(hasUnsavedChangesAtom);
  const remoteConflict = get(remoteConflictAtom);
  return canSubmitCharacter(get) && selection.characterId !== null && hasUnsavedChanges && remoteConflict === null;
});

export const saveCharacterAtom = atom(
  null,
  async (get, set, { editor, intent }: { editor: CcfoliaEditorCharacter; intent: SaveIntent }) => {
    const form = get(formPortAtom);
    const canSave =
      intent === 'overwrite' ? get(canOverwriteSelectedCharacterAtom) : get(canCreateCharacterFromEditorAtom);
    if (!form || !canSave) {
      return;
    }

    const operationUid = get(authUserAtom)?.uid ?? null;
    const selection = get(selectionAtom);
    const editorContentVersion = get(editorContentVersionAtom);
    const operation: SaveOperation = { intent, characterId: selection.characterId, editorContentVersion };
    const operationKey = saveOperationKey(operation);
    const initialFeedbackKey = saveFeedbackKey(intent, selection.characterId);
    if (get(savingOperationsAtom).has(operationKey)) return;
    set(savingOperationsAtom, (current) => new Map(current).set(operationKey, operation));
    set(successfulSaveFeedbacksAtom, (current) => {
      if (!current.has(initialFeedbackKey)) return current;
      const next = new Map(current);
      next.delete(initialFeedbackKey);
      return next;
    });

    const operationIsCurrent = () => (get(authUserAtom)?.uid ?? null) === operationUid && get(formPortAtom) === form;
    const operationStillOwnsEditor = () => {
      const currentSelection = get(selectionAtom);
      return (
        operationIsCurrent() &&
        get(editorContentVersionAtom) === editorContentVersion &&
        currentSelection.characterId === selection.characterId &&
        currentSelection.revision === selection.revision
      );
    };

    try {
      const submittedEditor = structuredClone(editor);
      const data = toCcfoliaCharacterData(submittedEditor);
      let characterId: string;
      let revision: number;
      if (intent === 'create') {
        characterId = await set(createCcfoliaCharacterAtom, data);
        revision = 1;
      } else {
        if (selection.characterId === null || selection.revision === null) {
          throw new CcfoliaCharacterConflictError();
        }
        characterId = selection.characterId;
        revision = await set(updateCcfoliaCharacterAtom, {
          characterId: selection.characterId,
          expectedRevision: selection.revision,
          data,
        });
      }

      if (!operationIsCurrent()) return;
      sendGoogleAnalyticsEvent('save_ccfolia_character', { action: intent });
      set(successfulSaveFeedbacksAtom, (current) => {
        const feedbackKey = saveFeedbackKey(intent, characterId);
        const previous = current.get(feedbackKey);
        return new Map(current).set(feedbackKey, {
          value: intent,
          invocation: (previous?.invocation ?? 0) + 1,
          expiresAt: Date.now() + 1_500,
        });
      });
      if (operationStillOwnsEditor()) {
        set(selectionAtom, { characterId, revision });
        set(remoteConflictAtom, null);
        const savedBaseline = createSavedEditorBaseline(data, submittedEditor);
        form.reset(
          savedBaseline,
          editorValuesMatch(form.getValues(), submittedEditor) ? undefined : { keepValues: true },
        );
      }
    } catch (saveError) {
      if (!operationIsCurrent()) return;
      if (saveError instanceof CcfoliaCharacterConflictError || saveError instanceof CcfoliaCharacterNotFoundError) {
        sendGoogleAnalyticsEvent('save_ccfolia_character_error', { action: intent, reason: 'conflict' });
        if (operationStillOwnsEditor()) {
          set(remoteConflictAtom, saveError instanceof CcfoliaCharacterNotFoundError ? 'deleted' : 'updated');
          toast({
            title: '別の場所で変更されています',
            description: '最新の状態を確認するか、現在の編集内容を新規キャラクターとして保存してください。',
            variant: 'destructive',
          });
        }
      } else if (saveError instanceof CcfoliaCharacterLimitError) {
        sendGoogleAnalyticsEvent('save_ccfolia_character_error', { action: intent, reason: 'limit' });
        toast({
          title: '保存件数の上限に達しました',
          description: '別のタブで保存上限に達しました。既存データを削除するか、プロプランをご利用ください。',
          variant: 'destructive',
        });
      } else if (saveError instanceof CcfoliaCharacterTooLargeError) {
        sendGoogleAnalyticsEvent('save_ccfolia_character_error', { action: intent, reason: 'too_large' });
        toast({
          title: 'データ量が大きすぎます',
          description: 'メモ、パラメータ、チャットパレットを短くしてから再度保存してください。',
          variant: 'destructive',
        });
      } else {
        console.error('Failed to save CCFOLIA character', saveError);
        captureClientException(saveError);
        toast({
          title: 'キャラクターを保存できませんでした',
          description: '時間をおいてもう一度お試しください。',
          variant: 'destructive',
        });
      }
    } finally {
      set(savingOperationsAtom, (current) => {
        if (current.get(operationKey) !== operation) return current;
        const next = new Map(current);
        next.delete(operationKey);
        return next;
      });
    }
  },
);

export const createFromCurrentEditorAtom = atom(null, (get, set) => {
  const form = get(formPortAtom);
  if (!form) return;
  form.submit((editor) => set(saveCharacterAtom, { editor, intent: 'create' }), reportInvalidEditor);
});
