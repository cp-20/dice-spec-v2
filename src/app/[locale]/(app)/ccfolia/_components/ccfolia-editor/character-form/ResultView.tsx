'use client';

import { IconCheck, IconClipboard } from '@tabler/icons-react';
import { t } from 'i18next';
import { type FC, useCallback, useId } from 'react';

import { ActionButtonFeedback } from '@/shared/components/ui/action-button-feedback';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { useToast } from '@/shared/components/ui/use-toast';
import { captureClientException } from '@/shared/lib/sentryClient';

import { useTimedFeedback } from '../useTimedFeedback';

type ResultViewProps = { formResult: string };

export const ResultView: FC<ResultViewProps> = ({ formResult }) => {
  const { visible: done, show: showDone } = useTimedFeedback(1_000);
  const headingId = useId();
  const { toast } = useToast();

  const handleCopyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formResult);
    } catch (copyError) {
      console.error('Failed to copy CCFOLIA result', copyError);
      captureClientException(copyError);
      toast({ title: t('ccfolia:copy-error'), variant: 'destructive' });
      return;
    }

    showDone();
  }, [formResult, showDone, toast]);

  return (
    <div className="space-y-2">
      <div id={headingId} className="text-sm font-bold">
        {t('ccfolia:result')}
      </div>
      <Textarea value={formResult} readOnly aria-labelledby={headingId} />
      <Button type="button" variant="secondary" className="w-full" onClick={handleCopyToClipboard}>
        <ActionButtonFeedback
          state={done ? 'success' : 'idle'}
          idle={
            <>
              <IconClipboard />
              <span>{t('ccfolia:copy-to-clipboard')}</span>
            </>
          }
          success={
            <>
              <IconCheck />
              <span>{t('ccfolia:copy-success')}</span>
            </>
          }
        />
      </Button>
      <output className="sr-only" aria-live="polite">
        {done ? t('ccfolia:copy-success') : ''}
      </output>
    </div>
  );
};
