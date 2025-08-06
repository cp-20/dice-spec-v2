'use client';

import { t } from 'i18next';
import type { FC } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import {
  useDiceCommandInput,
  useDiceExpecterOption,
  useDiceExpecterResult,
  useRecalculation,
} from './hooks/useDiceExpecter';

export const DiceCommandInput: FC = () => {
  const { command, setCommand } = useDiceCommandInput();
  const {
    option: { autoRecalculation },
    setAutoRecalculation,
  } = useDiceExpecterOption();
  const { recalculate } = useRecalculation();
  const { result } = useDiceExpecterResult();

  const expectFailed = result !== null && !result.success;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          className="flex-1"
          placeholder={t('expect:input.placeholder')}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
        />
        <Button className="font-bold" onClick={recalculate}>
          {t('expect:input.calculation')}
        </Button>
      </div>
      {expectFailed && <div className="text-sm text-red-500">{t('expect:input.calculation-error')}</div>}
      <div className="items-top flex space-x-2">
        <Checkbox
          id="autoRecalculation"
          checked={autoRecalculation}
          onCheckedChange={(checked) => setAutoRecalculation(checked === 'indeterminate' ? true : checked)}
        />
        <label
          htmlFor="autoRecalculation"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t('expect:input.auto-recalculation-option')}
        </label>
      </div>
    </div>
  );
};
