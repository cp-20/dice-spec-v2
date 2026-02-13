import { clsx } from 'clsx';
import { t } from 'i18next';
import type { FC } from 'react';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { ALL_CHARACTER_ID } from './constants';

export type CharacterSelectViewProps = {
  enabled: boolean;
  characterId: string;
  setCharacterId: (id: string) => void;
  characters: { id: string; name: string }[];
};

export const CharacterSelectView: FC<CharacterSelectViewProps> = ({
  enabled,
  characterId,
  setCharacterId,
  characters,
}) => {
  return (
    <div className="space-y-4 @container">
      <div>
        <Label id="character-select-label" className="text-sm mb-1 font-bold block">
          {t('analyze-logs:character-select.label')}
        </Label>
        <Select
          disabled={!enabled}
          value={enabled ? characterId : ALL_CHARACTER_ID}
          onValueChange={setCharacterId}
          aria-labelledby="character-select-label"
        >
          <SelectTrigger className="w-full font-bold" aria-label={t('analyze-logs:character-select.label')}>
            <SelectValue
              placeholder={<span className="text-slate-500">{t('analyze-logs:character-select.label')}</span>}
            />
          </SelectTrigger>
          <SelectContent>
            {characters.map((character) => (
              <SelectItem
                key={character.id}
                value={character.id}
                className={clsx(character.id === ALL_CHARACTER_ID && 'font-semibold')}
              >
                {character.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
