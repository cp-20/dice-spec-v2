'use client';

import { IconStar, IconStarFilled } from '@tabler/icons-react';
import type { FC } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useDiceRoll } from './hooks/useDiceRoll';
import { useQuickInput } from './hooks/useQuickInput';

export const QuickInput: FC = () => {
  const { items, updateItem } = useQuickInput();
  const { diceRoll } = useDiceRoll();

  return (
    <div className="flex gap-2">
      {items.map((item) => (
        <div key={item.command} className="flex">
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-e-none border-r-0"
            onClick={() => updateItem({ ...item, isFavorite: !item.isFavorite })}
          >
            {item.isFavorite ? <IconStarFilled size="16" /> : <IconStar size="16" />}
          </Button>
          <Button variant="outline" className="h-8 rounded-s-none px-3" onClick={() => diceRoll(item.command)}>
            {item.command}
          </Button>
        </div>
      ))}
    </div>
  );
};
