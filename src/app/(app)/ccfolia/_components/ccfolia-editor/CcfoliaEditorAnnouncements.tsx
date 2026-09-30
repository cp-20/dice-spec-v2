'use client';

import { useAtomValue } from 'jotai';
import type { FC } from 'react';

import { successfulSaveFeedbacksAtom } from './character-save/saveOperation';
import { deletedCharacterFeedbackAtom } from './saved-characters/savedCharacters';

export const CcfoliaEditorAnnouncements: FC = () => {
  const successfulSaveFeedbacks = useAtomValue(successfulSaveFeedbacksAtom);
  const deletedCharacterFeedback = useAtomValue(deletedCharacterFeedbackAtom);

  return (
    <>
      <output className="sr-only" aria-live="polite">
        {[...successfulSaveFeedbacks].map(([operationKey, feedback]) => (
          <span key={`${operationKey}:${feedback.invocation}`}>保存しました</span>
        ))}
      </output>
      <output className="sr-only" aria-live="polite">
        {deletedCharacterFeedback ? (
          <span key={deletedCharacterFeedback.invocation}>{`${deletedCharacterFeedback.value}を削除しました`}</span>
        ) : (
          ''
        )}
      </output>
    </>
  );
};
