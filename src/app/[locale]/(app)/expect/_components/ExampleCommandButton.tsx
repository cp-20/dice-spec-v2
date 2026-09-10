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
        document.getElementById('dice-command')?.focus();
      }}
    >
      {command}
    </Button>
  );
};
