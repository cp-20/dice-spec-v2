'use client';

import { IconChevronDown, IconMinus, IconPlus } from '@tabler/icons-react';
import { type FC, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/shadcn-utils';

import { SIMPLE_DICE_COUNT_RANGE, SIMPLE_DICE_FACES_RANGE } from './hooks/simpleDiceTypes';
import { useSimpleDiceInput } from './hooks/useSimpleDiceInput';

const facesOptions = [2, 3, 4, 6, 8, 10, 12, 20, 100];

export const SimpleDiceInput: FC = () => {
  const { input, changeCount, rollInput } = useSimpleDiceInput();

  return (
    <div className="grid h-12 grid-cols-3 gap-3">
      <div className="flex items-center rounded-md border">
        <Button
          variant="ghost"
          className="h-full w-8 shrink-0 sm:w-10 rounded-r-none p-0"
          onClick={() => changeCount(-1)}
          disabled={input.count <= SIMPLE_DICE_COUNT_RANGE.min}
          aria-label="ダイスを1個減らす"
        >
          <IconMinus className="size-4" />
        </Button>
        <output aria-label="ダイスの個数" className="flex-1 text-center text-xl font-semibold tabular-nums">
          {input.count}
        </output>
        <Button
          variant="ghost"
          className="h-full w-8 shrink-0 sm:w-10 rounded-l-none p-0"
          onClick={() => changeCount(1)}
          disabled={input.count >= SIMPLE_DICE_COUNT_RANGE.max}
          aria-label="ダイスを1個増やす"
        >
          <IconPlus className="size-4" />
        </Button>
      </div>
      <FacesSelect />
      <Button className="h-full text-base font-semibold" onClick={rollInput}>
        振る
      </Button>
    </div>
  );
};

const FacesSelect: FC = () => {
  const { input, changeFaces } = useSimpleDiceInput();
  const [open, setOpen] = useState(false);
  const [customFaces, setCustomFaces] = useState('');

  const select = (faces: number) => {
    changeFaces(faces);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        setCustomFaces('');
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-full justify-between px-3 text-xl font-semibold tabular-nums"
          aria-label={`ダイスの面数: ${input.faces}`}
        >
          D{input.faces}
          <IconChevronDown className="size-4 text-slate-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3 p-3">
        <div className="grid grid-cols-3 gap-2">
          {facesOptions.map((faces) => (
            <Button
              key={faces}
              variant="outline"
              className={cn('h-11 font-semibold', faces === input.faces && 'border-slate-400 bg-slate-100')}
              aria-pressed={faces === input.faces}
              onClick={() => select(faces)}
            >
              D{faces}
            </Button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const faces = Math.trunc(Number(customFaces));
            if (!Number.isNaN(faces)) select(faces);
          }}
        >
          <Input
            type="number"
            inputMode="numeric"
            {...SIMPLE_DICE_FACES_RANGE}
            value={customFaces}
            onChange={(event) => setCustomFaces(event.target.value)}
            placeholder="その他の面数"
            aria-label="その他の面数"
            className="h-11"
          />
          <Button type="submit" variant="secondary" className="h-11" disabled={customFaces === ''}>
            決定
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
};
