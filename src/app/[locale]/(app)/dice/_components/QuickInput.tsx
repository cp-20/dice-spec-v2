'use client';

import { IconStar, IconStarFilled } from '@tabler/icons-react';
import clsx from 'clsx';
import { t } from 'i18next';
import type { FC } from 'react';
import { Trans } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { isOldApp } from '@/shared/lib/const';
import styles from '@/shared/styles/pretty-scrollbar.module.css';
import { useDiceRoll } from './hooks/useDiceRoll';
import { useQuickInput } from './hooks/useQuickInput';

export const QuickInput: FC = () => {
  const { items, updateItem } = useQuickInput();
  const { diceRoll } = useDiceRoll();

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
              aria-label={
                item.isFavorite
                  ? t('dice:advanced.quick-input.remove-favorite', { command: item.command })
                  : t('dice:advanced.quick-input.add-favorite', { command: item.command })
              }
            >
              {item.isFavorite ? <IconStarFilled size="16" /> : <IconStar size="16" />}
            </Button>
            <Button variant="outline" className="h-8 rounded-s-none px-3" onClick={() => diceRoll(item.command)}>
              {item.command}
            </Button>
          </div>
        ))}
      </div>
      {!isOldApp && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          <Trans
            i18nKey="dice:advanced.quick-input.migration-announcement"
            components={{
              // biome-ignore lint/a11y/useAnchorContent: 後で children が渡される
              l: <a href="https://dicespec.vercel.app/dice?keep-old=true" className="underline hover:opacity-70" />,
            }}
          />
        </p>
      )}
    </div>
  );
};
