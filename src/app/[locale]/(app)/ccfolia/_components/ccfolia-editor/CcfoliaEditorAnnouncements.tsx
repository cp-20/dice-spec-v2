'use client';

import { t } from 'i18next';
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
          <span key={`${operationKey}:${feedback.invocation}`}>{t('ccfolia:saved.save-success')}</span>
        ))}
      </output>
      <output className="sr-only" aria-live="polite">
        {deletedCharacterFeedback ? (
          <span key={deletedCharacterFeedback.invocation}>
            {t('ccfolia:saved.delete-success-description', { name: deletedCharacterFeedback.value })}
          </span>
        ) : (
          ''
        )}
      </output>
    </>
  );
};
