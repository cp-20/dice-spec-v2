import { t } from 'i18next';
import { atom, type Getter, type Setter } from 'jotai';
import { withAtomEffect } from 'jotai-effect';

import { meAtom } from '@/features/account/firebase/accountStore';
import {
  createCcfoliaCharacterQueryAtom,
  createCcfoliaCharactersQueryAtoms,
} from '@/features/ccfolia/firebase/characters';
import {
  CcfoliaCharacterConflictError,
  CcfoliaCharacterNotFoundError,
  deleteCcfoliaCharacterAtom as deleteCcfoliaCharacterMutationAtom,
} from '@/features/ccfolia/firebase/mutations';
import {
  CCFOLIA_CHARACTER_SAVE_LIMIT_FREE,
  createDefaultCcfoliaEditorCharacter,
  type CcfoliaCharacterDocument,
  type CcfoliaEditorCharacter,
  stringifyCcfoliaClipboardCharacter,
  toCcfoliaEditorCharacter,
} from '@/features/ccfolia/model';
import { toast } from '@/shared/components/ui/use-toast';
import { authUserAtom } from '@/shared/lib/firebase/useFirebaseAuth';
import { captureClientException } from '@/shared/lib/sentryClient';
import { sendGoogleAnalyticsEvent } from '@/shared/lib/useGoogleAnalytics';

import { type EditorFormPort, formPortAtom, formSnapshotAtom } from '../character-form/editorForm';
import { savingCharacterIdsAtom } from '../character-save/saveOperation';

export type RemoteConflict = 'deleted' | 'updated' | null;

export type EditorSelection = {
  characterId: string | null;
  revision: number | null;
};

const selectionStateAtom = atom<EditorSelection>({ characterId: null, revision: null });
export const remoteConflictAtom = atom<RemoteConflict>(null);
export const hiddenCharacterIdsAtom = atom<ReadonlySet<string>>(new Set<string>());
export const deletedCharacterFeedbackAtom = atom<{ value: string; invocation: number } | null>(null);

const selectedCharacterIdAtom = atom((get) => get(selectionStateAtom).characterId);
const charactersQuery = createCcfoliaCharactersQueryAtoms(authUserAtom);
export const savedCharactersAtom = charactersQuery.charactersAtom;
const loadMoreCharactersQueryAtom = charactersQuery.loadMoreAtom;
export const selectedCharacterQueryAtom = createCcfoliaCharacterQueryAtom(authUserAtom, selectedCharacterIdAtom);

const hideCharacter = (set: Setter, characterId: string) => {
  set(hiddenCharacterIdsAtom, (current) => {
    if (current.has(characterId)) return current;
    const next = new Set(current);
    next.add(characterId);
    return next;
  });
};

export const selectionAtom = withAtomEffect(selectionStateAtom, (get, set) => {
  const uid = get(authUserAtom)?.uid ?? null;
  const selection = get(selectionStateAtom);
  const remote = get(selectedCharacterQueryAtom);
  const form = get(formPortAtom);
  if (
    !selection.characterId ||
    remote.ownerUid !== uid ||
    remote.characterId !== selection.characterId ||
    remote.loading ||
    get(savingCharacterIdsAtom).has(selection.characterId)
  ) {
    return;
  }

  if (remote.exists === false || (remote.exists === true && !remote.character)) {
    if (get(remoteConflictAtom) !== 'deleted') {
      hideCharacter(set, selection.characterId);
      set(remoteConflictAtom, 'deleted');
    }
    return;
  }
  const latest = remote.character;
  if (!latest || (selection.revision !== null && latest.revision <= selection.revision)) return;
  if (get(formSnapshotAtom).isDirty) {
    if (get(remoteConflictAtom) !== 'updated') set(remoteConflictAtom, 'updated');
    return;
  }
  if (!form) return;
  set(selectionStateAtom, { characterId: selection.characterId, revision: latest.revision });
  set(remoteConflictAtom, null);
  form.reset(toCcfoliaEditorCharacter(latest));
});

export const hasUnsavedChangesAtom = atom(
  (get) => get(formSnapshotAtom).isDirty || get(remoteConflictAtom) === 'deleted',
);

export const visibleCharactersAtom = atom((get) => {
  const hiddenCharacterIds = get(hiddenCharacterIdsAtom);
  return get(savedCharactersAtom).characters.filter(({ id }) => !hiddenCharacterIds.has(id));
});

export const savedCharacterCountAtom = atom((get) => {
  const me = get(meAtom);
  return me ? Math.max(me.ccfoliaCharacterCount, get(visibleCharactersAtom).length) : 0;
});

export const canCreateSavedCharacterAtom = atom((get) => {
  const me = get(meAtom);
  return Boolean(me && (me.plan === 'pro' || get(savedCharacterCountAtom) < CCFOLIA_CHARACTER_SAVE_LIMIT_FREE));
});

export const selectableCharactersAtom = atom((get) => {
  const characters = get(visibleCharactersAtom);
  const hiddenCharacterIds = get(hiddenCharacterIdsAtom);
  const remote = get(selectedCharacterQueryAtom);
  const selection = get(selectionAtom);
  const uid = get(authUserAtom)?.uid ?? null;
  const selectedRemoteCharacter =
    remote.ownerUid === uid &&
    remote.characterId === selection.characterId &&
    remote.characterId !== null &&
    !hiddenCharacterIds.has(remote.characterId)
      ? remote.character
      : null;
  if (!selectedRemoteCharacter) return characters;
  return characters.some(({ id }) => id === selectedRemoteCharacter.id)
    ? characters.map((character) => (character.id === selectedRemoteCharacter.id ? selectedRemoteCharacter : character))
    : [selectedRemoteCharacter, ...characters];
});

export const resetEditorToNew = (set: Setter, form: EditorFormPort) => {
  set(selectionAtom, { characterId: null, revision: null });
  set(remoteConflictAtom, null);
  form.reset(createDefaultCcfoliaEditorCharacter());
};

export const resetEditorAsUnsavedNew = (form: EditorFormPort, character: CcfoliaEditorCharacter) => {
  form.reset(createDefaultCcfoliaEditorCharacter());
  form.reset(character, { keepDefaultValues: true });
};

export const confirmDiscardChanges = (get: Getter) =>
  !get(hasUnsavedChangesAtom) || window.confirm(t('ccfolia:saved.confirm-discard'));

export const resetToNewAtom = atom(null, (get, set) => {
  const form = get(formPortAtom);
  if (!form || !confirmDiscardChanges(get)) return;
  resetEditorToNew(set, form);
  sendGoogleAnalyticsEvent('start_new_ccfolia_character');
});

export const selectCharacterAtom = atom(null, (get, set, characterId: string) => {
  const form = get(formPortAtom);
  const selection = get(selectionAtom);
  if (!form || characterId === selection.characterId || !confirmDiscardChanges(get)) {
    return;
  }
  const character = get(selectableCharactersAtom).find((item) => item.id === characterId);
  if (!character) return;

  set(selectionAtom, { characterId: character.id, revision: character.revision });
  set(remoteConflictAtom, null);
  form.reset(toCcfoliaEditorCharacter(character));
  sendGoogleAnalyticsEvent('load_saved_ccfolia_character');
});

export const exportCharacterAtom = atom(null, async (_get, _set, character: CcfoliaCharacterDocument) => {
  try {
    await navigator.clipboard.writeText(stringifyCcfoliaClipboardCharacter(toCcfoliaEditorCharacter(character)));
  } catch (exportError) {
    console.error('CCFOLIA_SAVED_CHARACTER_EXPORT_FAILED');
    captureClientException(exportError);
    toast({ title: t('ccfolia:copy-error'), variant: 'destructive' });
    return false;
  }
  sendGoogleAnalyticsEvent('export_saved_ccfolia_character');
  return true;
});

export const deleteCharacterAtom = atom(null, async (get, set, character: CcfoliaCharacterDocument) => {
  const form = get(formPortAtom);
  const selection = get(selectionAtom);
  if (!form) return;
  const deletingSelectedCharacter = character.id === selection.characterId;
  const confirmationKey =
    deletingSelectedCharacter && get(hasUnsavedChangesAtom)
      ? 'ccfolia:saved.confirm-delete-with-unsaved'
      : 'ccfolia:saved.confirm-delete';
  if (!window.confirm(t(confirmationKey, { name: character.name }))) return;

  const operationUid = get(authUserAtom)?.uid ?? null;
  const editorAtStart = structuredClone(form.getValues());
  const operationIsCurrent = () => (get(authUserAtom)?.uid ?? null) === operationUid && get(formPortAtom) === form;
  try {
    await set(deleteCcfoliaCharacterMutationAtom, {
      characterId: character.id,
      expectedRevision: character.revision,
    });
    if (!operationIsCurrent()) return;
    sendGoogleAnalyticsEvent('delete_saved_ccfolia_character');
    hideCharacter(set, character.id);
    if (get(selectionAtom).characterId === character.id) {
      const currentForm = get(formPortAtom);
      if (currentForm) {
        const currentEditor = currentForm.getValues();
        if (JSON.stringify(currentEditor) === JSON.stringify(editorAtStart)) {
          resetEditorToNew(set, currentForm);
        } else {
          set(selectionAtom, { characterId: null, revision: null });
          set(remoteConflictAtom, null);
          resetEditorAsUnsavedNew(currentForm, currentEditor);
        }
      }
    }
    set(deletedCharacterFeedbackAtom, (current) => ({
      value: character.name,
      invocation: (current?.invocation ?? 0) + 1,
    }));
  } catch (deleteError) {
    if (!operationIsCurrent()) return;
    if (deleteError instanceof CcfoliaCharacterConflictError || deleteError instanceof CcfoliaCharacterNotFoundError) {
      if (deleteError instanceof CcfoliaCharacterNotFoundError) hideCharacter(set, character.id);
      const currentSelection = get(selectionAtom);
      if (currentSelection.characterId === character.id && currentSelection.revision === character.revision) {
        set(remoteConflictAtom, deleteError instanceof CcfoliaCharacterNotFoundError ? 'deleted' : 'updated');
        toast({
          title: t('ccfolia:saved.conflict-title'),
          description: t('ccfolia:saved.conflict-description'),
          variant: 'destructive',
        });
      }
    } else {
      console.error('Failed to delete CCFOLIA character', deleteError);
      captureClientException(deleteError);
      toast({
        title: t('ccfolia:saved.delete-error'),
        description: t('ccfolia:saved.delete-error-description'),
        variant: 'destructive',
      });
    }
  }
});

export const loadLatestCharacterAtom = atom(null, (get, set) => {
  const form = get(formPortAtom);
  const selection = get(selectionAtom);
  const remote = get(selectedCharacterQueryAtom);
  const uid = get(authUserAtom)?.uid ?? null;
  if (
    !form ||
    !selection.characterId ||
    remote.ownerUid !== uid ||
    remote.characterId !== selection.characterId ||
    !remote.character ||
    !confirmDiscardChanges(get)
  ) {
    return;
  }
  set(selectionAtom, { characterId: selection.characterId, revision: remote.character.revision });
  set(remoteConflictAtom, null);
  form.reset(toCcfoliaEditorCharacter(remote.character));
  sendGoogleAnalyticsEvent('resolve_ccfolia_character_conflict', { action: 'load_latest' });
});

export const continueAsNewAtom = atom(null, (get, set) => {
  const form = get(formPortAtom);
  if (!form) return;
  const character = form.getValues();
  set(selectionAtom, { characterId: null, revision: null });
  set(remoteConflictAtom, null);
  resetEditorAsUnsavedNew(form, character);
  sendGoogleAnalyticsEvent('resolve_ccfolia_character_conflict', { action: 'continue_as_new' });
});

export const loadMoreCharactersAtom = loadMoreCharactersQueryAtom;
