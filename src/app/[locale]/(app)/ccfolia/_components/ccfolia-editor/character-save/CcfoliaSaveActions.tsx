'use client';

import { IconCheck, IconCopyPlus, IconDeviceFloppy, IconLoader2 } from '@tabler/icons-react';
import { t } from 'i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import type { FC, ReactNode } from 'react';

import { ActionButtonFeedback, type ActionButtonState } from '@/shared/components/ui/action-button-feedback';
import { Button } from '@/shared/components/ui/button';
import { authUserAtom } from '@/shared/lib/firebase/useFirebaseAuth';
import { cn } from '@/shared/lib/shadcn-utils';

import { CCFOLIA_EDITOR_FORM_ID, editorContentVersionAtom } from '../character-form/editorForm';
import { selectionAtom } from '../saved-characters/savedCharacters';
import {
  canCreateCharacterFromEditorAtom,
  canOverwriteSelectedCharacterAtom,
  createFromCurrentEditorAtom,
} from './characterSave';
import { saveFeedbackKey, saveOperationKey, savingOperationsAtom, successfulSaveFeedbacksAtom } from './saveOperation';

const feedbackState = (saving: boolean, saved: boolean): ActionButtonState => {
  if (saving) return 'pending';
  if (saved) return 'success';
  return 'idle';
};

const SaveButtonContent: FC<{ state: ActionButtonState; icon: ReactNode; label: string }> = ({
  state,
  icon,
  label,
}) => (
  <ActionButtonFeedback
    state={state}
    idle={
      <>
        {icon}
        {label}
      </>
    }
    pending={
      <>
        <IconLoader2 className="size-4 animate-spin" />
        {t('ccfolia:saved.saving')}
      </>
    }
    success={
      <>
        <IconCheck className="size-4" />
        {t('ccfolia:saved.save-success')}
      </>
    }
  />
);

export const CcfoliaSaveActions: FC = () => {
  const uid = useAtomValue(authUserAtom)?.uid ?? null;
  const selectedCharacterId = useAtomValue(selectionAtom).characterId;
  const editorContentVersion = useAtomValue(editorContentVersionAtom);
  const savingOperations = useAtomValue(savingOperationsAtom);
  const successfulSaveFeedbacks = useAtomValue(successfulSaveFeedbacksAtom);
  const canCreateNew = useAtomValue(canCreateCharacterFromEditorAtom);
  const canOverwrite = useAtomValue(canOverwriteSelectedCharacterAtom);
  const createFromCurrentEditor = useSetAtom(createFromCurrentEditorAtom);
  if (!uid) return null;

  const createOperationKey = saveOperationKey({
    intent: 'create',
    characterId: selectedCharacterId,
    editorContentVersion,
  });
  const overwriteOperationKey = saveOperationKey({
    intent: 'overwrite',
    characterId: selectedCharacterId,
    editorContentVersion,
  });
  const createFeedbackKey = saveFeedbackKey('create', selectedCharacterId);
  const overwriteFeedbackKey = saveFeedbackKey('overwrite', selectedCharacterId);
  const creating = savingOperations.has(createOperationKey);
  const overwriting = savingOperations.has(overwriteOperationKey);
  const created = successfulSaveFeedbacks.has(createFeedbackKey);
  const overwritten = successfulSaveFeedbacks.has(overwriteFeedbackKey);

  const createButton = (
    <Button
      type={selectedCharacterId ? 'button' : 'submit'}
      form={selectedCharacterId ? undefined : CCFOLIA_EDITOR_FORM_ID}
      variant={selectedCharacterId ? 'outline' : 'default'}
      className={cn('w-full sm:w-auto', (creating || created) && 'disabled:opacity-100')}
      onClick={selectedCharacterId ? createFromCurrentEditor : undefined}
      disabled={!canCreateNew || creating || created}
    >
      <SaveButtonContent
        state={feedbackState(creating, created)}
        icon={<IconCopyPlus className="size-4" />}
        label={t('ccfolia:saved.create-save')}
      />
    </Button>
  );

  return (
    <div className="flex flex-col justify-end gap-2 border-t pt-4 sm:flex-row sm:items-center">
      {selectedCharacterId && createButton}
      {selectedCharacterId ? (
        <Button
          type="submit"
          form={CCFOLIA_EDITOR_FORM_ID}
          className={cn('w-full sm:w-auto', (overwriting || overwritten) && 'disabled:opacity-100')}
          disabled={!canOverwrite || overwriting || overwritten}
        >
          <SaveButtonContent
            state={feedbackState(overwriting, overwritten)}
            icon={<IconDeviceFloppy className="size-4" />}
            label={t('ccfolia:saved.overwrite-save')}
          />
        </Button>
      ) : (
        createButton
      )}
    </div>
  );
};
