'use client';

import clsx from 'clsx';
import { type FC } from 'react';
import { useCharacterSelect } from './hooks/useCharacterSelect';
import { useLogAnalysis } from './hooks/useLogAnalysis';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/shared/components/ui/select';

export const CharacterSelect: FC = () => {
  const { character, selectCharacter } = useCharacterSelect();
  const { result } = useLogAnalysis();

  return (
    <Select
      disabled={result.length === 0}
      value={result.length > 0 ? character : ''}
      onValueChange={selectCharacter}
    >
      <SelectTrigger
        className="w-full font-bold"
        aria-label="キャラクターを選択"
      >
        <SelectValue
          placeholder={<span className="text-slate-500">キャラを選択</span>}
        />
      </SelectTrigger>
      <SelectContent>
        {result.map((character) => (
          <SelectItem
            key={character.id}
            value={character.id}
            className={clsx(character.id === 'all' && 'font-semibold')}
          >
            {character.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
