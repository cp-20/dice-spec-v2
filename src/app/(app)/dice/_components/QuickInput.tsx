'use client';

import { IconStar, IconStarFilled } from '@tabler/icons-react';
import clsx from 'clsx';
import type { FC } from 'react';

import { Button } from '@/shared/components/ui/button';

import { useDiceRoll } from './hooks/useDiceRoll';
import { useQuickInput } from './hooks/useQuickInput';

import styles from '@/shared/styles/pretty-scrollbar.module.css';

export const QuickInput: FC = () => {
  const { items, updateItem } = useQuickInput();
  const { diceRoll, disabled } = useDiceRoll();

  return (
    <div>
      <div className={clsx('flex gap-2 overflow-x-auto pb-2', styles['pretty-scrollbar'])}>
        {items.map((item) => (
          <div key={item.command} className="flex">
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-e-none border-r-0"
              onClick={() => updateItem({ ...item, isFavorite: !item.isFavorite })}
              aria-label={item.isFavorite ? `${item.command}をお気に入りから削除` : `${item.command}をお気に入りに登録`}
            >
              {item.isFavorite ? <IconStarFilled size="16" /> : <IconStar size="16" />}
            </Button>
            <Button
              variant="outline"
              className="h-8 rounded-s-none px-3"
              disabled={disabled}
              onClick={() => diceRoll(item.command)}
            >
              {item.command}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
