'use client';

import type { FC } from 'react';

import { Button } from '@/shared/components/ui/button';

import { type SimpleDice, useSimpleDiceInput } from './hooks/useSimpleDiceInput';

const presets: SimpleDice[] = [
  { count: 1, faces: 6 },
  { count: 2, faces: 6 },
  { count: 3, faces: 6 },
  { count: 1, faces: 100 },
  { count: 2, faces: 10 },
  { count: 2, faces: 3 },
];

export const SimpleDiceQuickInput: FC = () => {
  const { roll } = useSimpleDiceInput();

  return (
    <div className="@container">
      <div className="grid grid-cols-3 gap-3 @md:grid-cols-6">
        {presets.map((dice) => (
          <Button
            key={`${dice.count}D${dice.faces}`}
            variant="outline"
            onClick={() => roll(dice)}
            className="font-semibold"
          >
            {dice.count}D{dice.faces}
          </Button>
        ))}
      </div>
    </div>
  );
};
