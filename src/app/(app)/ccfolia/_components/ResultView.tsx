'use client';

import { IconCheck, IconClipboard } from '@tabler/icons-react';
import clsx from 'clsx';
import { useCallback, type FC, useState } from 'react';
import { useFormResult } from './hooks/useFormResult';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';

export const ResultView: FC = () => {
  const { formResult } = useFormResult();
  const [done, setDone] = useState(false);

  const handleCopyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(formResult);

    setDone(true);
    const timeout = setTimeout(() => setDone(false), 1000);
    return () => {
      setDone(false);
      clearTimeout(timeout);
    };
  }, [formResult]);

  return (
    <div className="space-y-2">
      <div className="text-sm font-bold">出力結果</div>
      <Textarea value={formResult} readOnly />
      <Button
        variant="secondary"
        className="inline-fle relative w-full flex-col gap-2 overflow-y-clip"
        onClick={handleCopyToClipboard}
      >
        {done && (
          <IconCheck className="absolute animate-popup opacity-0 delay-150" />
        )}
        <div
          className={clsx(
            'flex items-center gap-2',
            !done && 'animate-slide-in-top',
            done && 'animate-slide-out-bottom',
          )}
        >
          <IconClipboard />
          <span>クリップボードにコピー</span>
        </div>
      </Button>
    </div>
  );
};
