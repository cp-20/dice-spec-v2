'use client';

import clsx from 'clsx';
import { Check, ChevronsUpDown } from 'lucide-react';

import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/shadcn-utils';

import styles from '@/shared/styles/pretty-scrollbar.module.css';

type GameSystem = {
  id: string;
  name: string;
  sort_key: string;
};

export type GameSystemSelectProps = {
  systems: GameSystem[];
};

export const GameSystemSelect: FC<GameSystemSelectProps> = ({ systems }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  useEffect(() => {
    setTimeout(() => {
      const button = buttonRef.current;
      const popover = popoverRef.current;
      if (!button || !popover) return;

      popover.style.width = `${button.offsetWidth}px`;
    }, 100);
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          ref={buttonRef}
        >
          {value ? (
            systems.find((system) => system.id === value)?.name
          ) : (
            <span className="text-slate-600">ゲームシステムを選択</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="h-60 p-0" ref={popoverRef}>
        {/* フィルタリングアルゴリズムをいい感じに上書きして最近使ったのを上に出す */}
        <Command className="h-full">
          <CommandInput placeholder="ゲームシステムを検索" />
          <CommandEmpty>
            利用可能なゲームシステムは存在しませんでした
          </CommandEmpty>
          <CommandGroup
            className={clsx(
              'h-fit overflow-y-auto',
              styles['pretty-scrollbar'],
            )}
          >
            {systems.map((system) => (
              <CommandItem
                key={system.id}
                value={system.name}
                onSelect={() => {
                  setValue(system.id === value ? '' : system.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value !== system.id && 'invisible',
                  )}
                />
                {system.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
