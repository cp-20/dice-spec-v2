'use client';

import { t } from 'i18next';

import { Button } from '@/shared/components/ui/button';

import { useDiceCommandInput, useRecalculation } from './hooks/useDiceExpecter';

export const ExampleCommandButton = ({ command }: { command: string }) => {
  const { setCommand } = useDiceCommandInput();
  const { calculateCommand } = useRecalculation();

  return (
    <Button
      type="button"
      variant="link"
      className="px-0 font-mono underline"
      aria-label={t('expect:guide.calculate', { command })}
      onClick={() => {
        setCommand(command);
        calculateCommand(command);
        const input = document.getElementById('dice-command');
        input?.focus({ preventScroll: true });
        input?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
          block: 'center',
        });
      }}
    >
      {command}
    </Button>
  );
};
