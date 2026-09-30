import { atom } from 'jotai';
import { withAtomEffect } from 'jotai-effect';

export type SaveIntent = 'overwrite' | 'create';

export type SaveOperation = {
  intent: SaveIntent;
  characterId: string | null;
  editorContentVersion: number;
};

export const saveOperationKey = ({ intent, characterId, editorContentVersion }: SaveOperation) =>
  intent === 'overwrite'
    ? `overwrite:${characterId ?? 'new-character'}`
    : `create:${characterId ?? 'new-character'}:${editorContentVersion}`;

export const saveFeedbackKey = (intent: SaveIntent, characterId: string | null) =>
  `${intent}:${characterId ?? 'new-character'}`;

export const savingOperationsAtom = atom<ReadonlyMap<string, SaveOperation>>(new Map());

export const savingCharacterIdsAtom = atom((get) => {
  const characterIds = new Set<string>();
  for (const operation of get(savingOperationsAtom).values()) {
    if (operation.intent === 'overwrite' && operation.characterId) characterIds.add(operation.characterId);
  }
  return characterIds;
});

export type SaveFeedback = {
  value: SaveIntent;
  invocation: number;
  expiresAt: number;
};

const successfulSaveFeedbacksStateAtom = atom<ReadonlyMap<string, SaveFeedback>>(new Map());
export const successfulSaveFeedbacksAtom = withAtomEffect(successfulSaveFeedbacksStateAtom, (get, set) => {
  const feedbacks = get(successfulSaveFeedbacksStateAtom);
  if (feedbacks.size === 0) return;

  const delay = Math.max(0, Math.min(...[...feedbacks.values()].map(({ expiresAt }) => expiresAt)) - Date.now());
  const timeout = setTimeout(() => {
    set(successfulSaveFeedbacksStateAtom, (current) => {
      const now = Date.now();
      const next = new Map([...current].filter(([, feedback]) => feedback.expiresAt > now));
      return next.size === current.size ? current : next;
    });
  }, delay);
  return () => clearTimeout(timeout);
});
