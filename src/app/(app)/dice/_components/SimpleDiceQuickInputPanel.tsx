'use client';
import { useCallback, type FC } from 'react';
import type { SimpleDiceQuickInputPanelProps } from './SimpleDiceQuickInput';
import {
  formatSimpleDices,
  useSimpleDiceRoll,
} from './hooks/useSimpleDiceRoll';
import { Button } from '@/shared/components/ui/button';

export const SimpleDiceQuickInputPanel: FC<SimpleDiceQuickInputPanelProps> = ({
  dices,
}) => {
  const { simpleDiceRoll } = useSimpleDiceRoll();

  const handleClick = useCallback(
    () => simpleDiceRoll(dices),
    [dices, simpleDiceRoll],
  );

  return (
    <Button variant="outline" onClick={handleClick} className="font-semibold">
      {formatSimpleDices(dices)}
    </Button>
  );
};
