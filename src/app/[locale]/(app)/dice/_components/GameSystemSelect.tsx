'use client';

import clsx from 'clsx';
import { t } from 'i18next';
import { Check, ChevronsUpDown } from 'lucide-react';

import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './GameSystemSelect.module.css';
import { useDiceRollOption } from './hooks/useDiceRollOption';
import { useGameSystemList } from './hooks/useGameSystemList';
import { Button } from '@/shared/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/shared/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/shadcn-utils';

import scrollbarStyles from '@/shared/styles/pretty-scrollbar.module.css';

export const GameSystemSelect: FC = () => {
  const { gameSystemList: systems, selectSystem } = useGameSystemList();

  const {
    option: { system },
    setSystem,
  } = useDiceRollOption();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // システムを変更する関数
  const changeSystem = useCallback(
    (id: string) => {
      setSystem(id);
      selectSystem(id);
    },
    [selectSystem, setSystem],
  );

  // セレクトメニューの幅をボタンの幅に合わせる
  useEffect(() => {
    setTimeout(() => {
      const button = buttonRef.current;
      const popover = popoverRef.current;
      if (!button || !popover) return;
      popover.style.width = `${button.offsetWidth}px`;
    }, 0);
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" asChild aria-expanded={open} className="w-full justify-between" ref={buttonRef}>
          <select>
            {systems && system ? (
              systems.find((s) => s.id === system)?.name
            ) : (
              <span className="text-slate-600">{t('dice:advanced.game-system.button')}</span>
            )}
          </select>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={clsx('h-60 p-0', styles['popover-content'])} ref={popoverRef}>
        {/* フィルタリングアルゴリズムをいい感じに上書きして最近使ったのを上に出す */}
        <Command className="h-full">
          <CommandInput placeholder={t('dice:advanced.game-system.search')} />
          <CommandEmpty>{t('dice:advanced.game-system.no-result')}</CommandEmpty>
          <CommandGroup className={clsx('h-fit overflow-y-auto', scrollbarStyles['pretty-scrollbar'])}>
            {systems?.map((s) => (
              <CommandItem
                key={s.id}
                value={s.name}
                onSelect={() => {
                  changeSystem(s.id === system ? '' : s.id);
                  setOpen(false);
                }}
              >
                <Check className={cn('mr-2 h-4 w-4', system !== s.id && 'invisible')} />
                {s.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
