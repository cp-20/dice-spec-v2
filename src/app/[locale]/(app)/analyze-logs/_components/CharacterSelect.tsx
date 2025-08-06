'use client';

import clsx from 'clsx';
import { t } from 'i18next';
import type { FC } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useCharacterSelect } from './hooks/useCharacterSelect';
import { useLogAnalysis } from './hooks/useLogAnalysis';

export const CharacterSelect: FC = () => {
  const { character, selectCharacter } = useCharacterSelect();
  const { result } = useLogAnalysis();

  return (
    <Select disabled={result.length === 0} value={result.length > 0 ? character : ''} onValueChange={selectCharacter}>
      <SelectTrigger className="w-full font-bold" aria-label={t('analyze-logs:character-select.label')}>
        <SelectValue placeholder={<span className="text-slate-500">{t('analyze-logs:character-select.label')}</span>} />
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
