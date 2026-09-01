import { atom } from 'jotai';
import { withAtomEffect } from 'jotai-effect';

import { authUserAtom, authUserLoadingAtom } from '@/shared/lib/firebase/useFirebaseAuth';

import { editorContentVersionAtom, formPortAtom, formSnapshotAtom } from './character-form/editorForm';
import { savingOperationsAtom, successfulSaveFeedbacksAtom } from './character-save/saveOperation';
import { navigationAtom, resetNavigationStateAtom, retainNavigationDraftAtom } from './navigation/navigationGuard';
import {
  deletedCharacterFeedbackAtom,
  hiddenCharacterIdsAtom,
  remoteConflictAtom,
  resetEditorToNew,
  selectionAtom,
} from './saved-characters/savedCharacters';

const previousUidStateAtom = atom<string | null | undefined>(undefined);

const authSessionAtom = withAtomEffect(previousUidStateAtom, (get, set) => {
  const uid = get(authUserAtom)?.uid ?? null;
  const form = get(formPortAtom);
  if (get(authUserLoadingAtom)) return;
  const previousUid = get(previousUidStateAtom);
  set(previousUidStateAtom, uid);
  if (previousUid === undefined || previousUid === uid || (previousUid === null && uid !== null)) return;
  if (form) resetEditorToNew(set, form);
  set(hiddenCharacterIdsAtom, new Set());
  set(savingOperationsAtom, new Map());
  set(successfulSaveFeedbacksAtom, new Map());
});

const editorLifecycleAtom = atom((get) => {
  get(authSessionAtom);
  get(navigationAtom);
});

export const ccfoliaEditorAtom = withAtomEffect(editorLifecycleAtom, (_get, set) => {
  return () => {
    set(retainNavigationDraftAtom);
    set(selectionAtom, { characterId: null, revision: null });
    set(remoteConflictAtom, null);
    set(formPortAtom, null);
    set(formSnapshotAtom, { characterName: '', isDirty: false });
    set(editorContentVersionAtom, 0);
    set(hiddenCharacterIdsAtom, new Set());
    set(previousUidStateAtom, undefined);
    set(resetNavigationStateAtom);
    set(savingOperationsAtom, new Map());
    set(successfulSaveFeedbacksAtom, new Map());
    set(deletedCharacterFeedbackAtom, null);
  };
});
