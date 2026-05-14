import { IconUser } from '@tabler/icons-react';
import { t } from 'i18next';
import { useAtom, useAtomValue } from 'jotai';
import type { FC } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

import {
  ALL_SYSTEM_ID,
  activeTabAtom,
  allCharactersAtom,
  type SortOption,
  type SystemFilterOption,
  selectedCharacterIdAtom,
  selectedSystemAtom,
  sortOptionAtom,
  sortOptions,
  systemOptions,
} from './atoms';

export const AnalysisFilters: FC = () => {
  const activeTab = useAtomValue(activeTabAtom);
  const [selectedSystem, setSelectedSystem] = useAtom(selectedSystemAtom);
  const [selectedCharacterId, setSelectedCharacterId] = useAtom(selectedCharacterIdAtom);
  const [sortOption, setSortOption] = useAtom(sortOptionAtom);
  const allCharacterNames = useAtomValue(allCharactersAtom);

  const isPublicTab = activeTab === 'public';
  const availableSortOptions = isPublicTab ? sortOptions : sortOptions;

  return (
    <div className="@container">
      <div className="flex @max-2xl:flex-col flex-row gap-3">
        <Select value={selectedSystem} onValueChange={(v) => setSelectedSystem(v as SystemFilterOption)}>
          <SelectTrigger className="flex-1 @max-2xl:w-full">
            <SelectValue placeholder={t('analyze-logs:list.filters.system-placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {systemOptions.map((system) => (
              <SelectItem key={system.id} value={system.id}>
                {system.id === ALL_SYSTEM_ID ? t('analyze-logs:list.filters.all-systems') : system.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!isPublicTab && (
          <Select value={selectedCharacterId} onValueChange={setSelectedCharacterId}>
            <SelectTrigger className="w-64 @max-2xl:w-full">
              <div className="flex items-center gap-2">
                <IconUser className="size-4" />
                <SelectValue placeholder={t('analyze-logs:list.filters.character-placeholder')} />
              </div>
            </SelectTrigger>
            <SelectContent>
              {allCharacterNames.map((char) => (
                <SelectItem key={char.id} value={char.id}>
                  {char.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
          <SelectTrigger className="w-48 @max-2xl:w-full">
            <div className="flex items-center gap-2">
              <SelectValue placeholder={t('analyze-logs:list.filters.sort-placeholder')} />
            </div>
          </SelectTrigger>
          <SelectContent>
            {availableSortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className="inline-flex items-center gap-2">
                  <option.icon className="size-4" />
                  {t(option.labelKey)}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
