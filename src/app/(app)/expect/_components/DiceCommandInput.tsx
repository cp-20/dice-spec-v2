'use client';

import type { FC } from 'react';
import {
  useDiceCommandInput,
  useDiceExpecterOption,
  useDiceExpecterResult,
  useRecalculation,
} from '@/app/(app)/expect/_components/hooks/useDiceExpecter';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';

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
          placeholder="計算式を入力してください"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
        />
        <Button className="font-bold" onClick={recalculate}>
          計算
        </Button>
      </div>
      {expectFailed && (
        <div className="text-sm text-red-500">
          計算に失敗しました。計算式を確認してください。
        </div>
      )}
      <div className="items-top flex space-x-2">
        <Checkbox
          id="autoRecalculation"
          checked={autoRecalculation}
          onCheckedChange={(checked) =>
            setAutoRecalculation(checked === 'indeterminate' ? true : checked)
          }
        />
        <label
          htmlFor="autoRecalculation"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          変更時に自動で再計算
        </label>
      </div>
    </div>
  );
};
