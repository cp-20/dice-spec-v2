'use client';

import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import type { FC } from 'react';

import { CcfoliaEditorAnnouncements } from './CcfoliaEditorAnnouncements';
import { CcfoliaEditorForm } from './character-form/CcfoliaEditorForm';
import { CcfoliaSaveActions } from './character-save/CcfoliaSaveActions';
import { LoadClipboardButton } from './clipboard/LoadClipboardButton';
import { ccfoliaEditorAtom } from './editorLifecycle';
import { CcfoliaSavedCharacters } from './saved-characters/CcfoliaSavedCharacters';

const CcfoliaEditorEffects: FC = () => {
  useAtomValue(ccfoliaEditorAtom);
  return null;
};

export const CcfoliaEditor: FC = () => (
  <>
    <CcfoliaEditorEffects />
    <div className="space-y-12">
      <CcfoliaSavedCharacters />
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
          <span>{t('ccfolia:load-clipboard.separator')}</span>
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>
        <LoadClipboardButton />
      </div>
      <CcfoliaEditorForm />
      <CcfoliaSaveActions />
      <CcfoliaEditorAnnouncements />
    </div>
  </>
);
