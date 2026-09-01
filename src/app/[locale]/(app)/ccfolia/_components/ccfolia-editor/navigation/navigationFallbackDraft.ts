import type { CcfoliaEditorCharacter } from '@/features/ccfolia/model';

export type NavigationFallbackDraft = {
  uid: string | null;
  character: CcfoliaEditorCharacter;
  selectedCharacterId: string | null;
  selectedRevision: number | null;
};

let retainedDraft: NavigationFallbackDraft | null = null;

export const retainNavigationFallbackDraft = (nextDraft: NavigationFallbackDraft) => {
  retainedDraft = nextDraft;
};

export const takeNavigationFallbackDraft = (uid: string | null) => {
  const draft = retainedDraft;
  retainedDraft = null;
  return draft?.uid === uid ? draft : null;
};
