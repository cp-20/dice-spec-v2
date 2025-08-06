'use client';

import { type FC, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import type { SimpleDices } from './hooks/useSimpleDiceInput';
import { formatSimpleDices, useSimpleDiceRoll } from './hooks/useSimpleDiceRoll';

export const SimpleDiceQuickInput: FC = () => {
  return (
    <div className="@container">
      <div className="grid grid-cols-3 gap-4 @md:grid-cols-6">
        <SimpleDiceQuickInputPanel dices={{ 6: 1 }} />
        <SimpleDiceQuickInputPanel dices={{ 6: 2 }} />
        <SimpleDiceQuickInputPanel dices={{ 6: 3 }} />
        <SimpleDiceQuickInputPanel dices={{ 100: 1 }} />
        <SimpleDiceQuickInputPanel dices={{ 10: 2 }} />
        <SimpleDiceQuickInputPanel dices={{ 3: 2 }} />
      </div>
    </div>
  );
};

type SimpleDiceQuickInputPanelProps = {
  dices: Partial<SimpleDices>;
};

const SimpleDiceQuickInputPanel: FC<SimpleDiceQuickInputPanelProps> = ({ dices }) => {
  const { simpleDiceRoll } = useSimpleDiceRoll();

  const handleClick = useCallback(() => {
    simpleDiceRoll(dices);
  }, [dices, simpleDiceRoll]);

  return (
    <Button variant="outline" onClick={handleClick} className="font-semibold">
      {formatSimpleDices(dices)}
    </Button>
  );
};
