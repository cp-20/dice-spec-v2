'use client';

import { IconCheck, IconClipboard, IconLoader2 } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { type FC, useCallback, useState } from 'react';

import { ActionButtonFeedback } from '@/shared/components/ui/action-button-feedback';
import { Button } from '@/shared/components/ui/button';

import { useTimedFeedback } from '../useTimedFeedback';
import { loadClipboardCharacterAtom } from './clipboardImport';

export const LoadClipboardButton: FC = () => {
  const { visible: done, show: showDone } = useTimedFeedback(1_000);
  const [loading, setLoading] = useState(false);
  const loadCharacter = useSetAtom(loadClipboardCharacterAtom);

  const handleCopyFromClipboard = useCallback(async () => {
    setLoading(true);
    try {
      if (await loadCharacter()) showDone();
    } finally {
      setLoading(false);
    }
  }, [loadCharacter, showDone]);

  return (
    <div>
      <Button type="button" variant="secondary" className="w-full" onClick={handleCopyFromClipboard} disabled={loading}>
        <ActionButtonFeedback
          state={loading ? 'pending' : done ? 'success' : 'idle'}
          idle={
            <>
              <IconClipboard />
              <span>クリップボードから読み込む</span>
            </>
          }
          pending={
            <>
              <IconLoader2 className="size-4 animate-spin" />
              <span>クリップボードから読み込む</span>
            </>
          }
          success={
            <>
              <IconCheck />
              <span>読み込みました</span>
            </>
          }
        />
      </Button>
      <output className="sr-only" aria-live="polite">
        {done ? '読み込みました' : ''}
      </output>
    </div>
  );
};
