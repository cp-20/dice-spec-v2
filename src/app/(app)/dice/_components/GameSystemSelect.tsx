'use client';

import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import { Check, ChevronsUpDown, LoaderCircle } from 'lucide-react';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/shared/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { gameSystemsById } from '@/shared/lib/bcdice/loader';
import { cn } from '@/shared/lib/shadcn-utils';

import { gameSystemListAtom } from './gameSystemHistory';
import { useGameSystem } from './hooks/useGameSystem';

import styles from './GameSystemSelect.module.css';
import scrollbarStyles from '@/shared/styles/pretty-scrollbar.module.css';

export const GameSystemSelect: FC = () => {
  const systems = useAtomValue(gameSystemListAtom);

  const {
    selection: { system, status },
    setSystem,
  } = useGameSystem();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

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
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            aria-expanded={open}
            className="w-full justify-between"
            ref={buttonRef}
            aria-busy={status === 'loading'}
          >
            {systems && system ? (
              systems.find((s) => s.id === system)?.name
            ) : (
              <span className="text-slate-600">ゲームシステムを選択</span>
            )}
            {status === 'loading' ? (
              <output className="ml-2 shrink-0">
                <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
                <span className="sr-only">読み込み中…</span>
              </output>
            ) : (
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={clsx('h-60 p-0', styles['popover-content'])} ref={popoverRef}>
          {/* フィルタリングアルゴリズムをいい感じに上書きして最近使ったのを上に出す */}
          <Command className="h-full">
            <CommandInput placeholder="ゲームシステムを検索" />
            <CommandEmpty>該当するゲームシステムが見つかりませんでした。</CommandEmpty>
            <CommandGroup className={clsx('h-fit overflow-y-auto', scrollbarStyles['pretty-scrollbar'])}>
              {systems?.map((s) => (
                <CommandItem
                  key={s.id}
                  value={s.name}
                  disabled={!gameSystemsById.has(s.id)}
                  onSelect={() => {
                    setSystem(s.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 size-4', system !== s.id && 'invisible')} />
                  {s.name}
                  {!gameSystemsById.has(s.id) && ` (${'このバージョンでは利用できません'})`}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {status === 'error' && (
        <p role="alert" className="text-sm text-red-500">
          ゲームシステムを読み込めませんでした。{' '}
          {/* チャンク取得失敗はランタイムに保持されるため、復旧にはページの再読み込みが必要。 */}
          <Button variant="link" onClick={() => window.location.reload()}>
            ページを再読み込み
          </Button>
        </p>
      )}
    </div>
  );
};
