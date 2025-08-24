'use client';

import { IconMinus, IconPlus } from '@tabler/icons-react';
import { t } from 'i18next';
import { type FC, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import type { AvailableDice } from './hooks/useSimpleDiceInput';
import { useSimpleDiceInput } from './hooks/useSimpleDiceInput';

export const SimpleDiceInput: FC = () => {
  const { simpleDices, resetDice, rollDice } = useSimpleDiceInput();

  const handleResetDice = useCallback(() => {
    resetDice();
  }, [resetDice]);

  const handleRollDice = useCallback(() => {
    rollDice();
  }, [rollDice]);

  return (
    <div className="space-y-8 @container">
      <div className="grid grid-cols-2 gap-4 @xl:grid-cols-4">
        {Object.entries(simpleDices).map(([dice, count]) => (
          <SimpleDiceInputPanel key={dice} dice={dice as AvailableDice} count={count} />
        ))}
      </div>

      <div className="flex gap-4">
        <Button className="flex-1" variant="secondary" onClick={handleResetDice}>
          {t('dice:simple.reset-dice')}
        </Button>
        <Button className="flex-1" variant="default" onClick={handleRollDice}>
          {t('dice:simple.roll-dice')}
        </Button>
      </div>
    </div>
  );
};

type SimpleDiceInputPanelProps = {
  dice: AvailableDice;
  count: number;
};

const SimpleDiceInputPanel: FC<SimpleDiceInputPanelProps> = ({ dice, count }) => {
  const { decrementDice, incrementDice } = useSimpleDiceInput();

  const handleIncrement = useCallback(() => {
    incrementDice(dice);
  }, [incrementDice, dice]);

  const handleDecrement = useCallback(() => {
    decrementDice(dice);
  }, [decrementDice, dice]);

  return (
    <div className="inline-flex items-center justify-center gap-2">
      <Button
        variant="outline"
        className="size-8 p-2"
        onClick={handleDecrement}
        disabled={count <= 0}
        aria-label={t('dice:simple.decrement', { dice: `D${dice}` })}
      >
        <IconMinus className="inline-block size-4" />
      </Button>
      <div className="w-20 select-none text-center text-lg font-medium">
        {count}D{dice}
      </div>
      <Button
        variant="outline"
        className="size-8 p-2"
        disabled={count >= 999}
        onClick={handleIncrement}
        aria-label={t('dice:simple.increment', { dice: `D${dice}` })}
      >
        <IconPlus className="inline-block size-4" />
      </Button>
    </div>
  );
};
