import { IconSortAscending, IconSortAscendingNumbers } from '@tabler/icons-react';
import { atom } from 'jotai';
import { ALL_CHARACTER_ID, ALL_CHARACTER_NAME } from '@/app/[locale]/(app)/analyze-logs/_components/constants';
import { myAnalysesAtom } from '@/shared/lib/firebase/stores/analyses/userAnalyses';
import type { AnalysisDocument } from '@/shared/lib/firebase/stores/collections';
import { systems } from '../../_components/hooks/ccfoliaLogAnalysis/messageParser';

interface SortOptionItem {
  value: string;
  labelKey: `analyze-logs:list.sort.${string}`;
  icon: typeof IconSortAscending | typeof IconSortAscendingNumbers;
}

export const sortOptions = [
  { value: 'newest', labelKey: 'analyze-logs:list.sort.newest', icon: IconSortAscending },
  { value: 'oldest', labelKey: 'analyze-logs:list.sort.oldest', icon: IconSortAscending },
  {
    value: 'deviationScoreDesc',
    labelKey: 'analyze-logs:list.sort.deviationScoreDesc',
    icon: IconSortAscendingNumbers,
  },
  { value: 'deviationScoreAsc', labelKey: 'analyze-logs:list.sort.deviationScoreAsc', icon: IconSortAscendingNumbers },
] as const satisfies SortOptionItem[];

export type SortOption = (typeof sortOptions)[number]['value'];

export const ALL_SYSTEM_ID = 'all-systems';

export const systemOptions = [{ id: ALL_SYSTEM_ID, name: '' }, ...Object.values(systems)] as const;

export type SystemFilterOption = (typeof systemOptions)[number]['id'];

const baseActiveTabAtom = atom<'public' | 'mine'>('mine');

export const selectedSystemAtom = atom<SystemFilterOption>(ALL_SYSTEM_ID);
export const selectedCharacterIdAtom = atom(ALL_CHARACTER_ID);
export const sortOptionAtom = atom<SortOption>('newest');

export const activeTabAtom = atom(
  (get) => get(baseActiveTabAtom),
  (get, set, newValue: 'public' | 'mine' | string) => {
    if (newValue !== 'public' && newValue !== 'mine') return;

    const prevValue = get(baseActiveTabAtom);

    if (prevValue !== newValue) {
      set(selectedSystemAtom, ALL_SYSTEM_ID);
      set(selectedCharacterIdAtom, ALL_CHARACTER_ID);
      set(sortOptionAtom, 'newest');
    }

    set(baseActiveTabAtom, newValue);
  },
);

export const allCharactersAtom = atom((get) => {
  const allAnalyses = get(myAnalysesAtom);
  const characterMap = new Map<string, { name: string; count: number }>();

  for (const analysis of allAnalyses) {
    for (const character of analysis.characterResults) {
      if (character.id === ALL_CHARACTER_ID) continue;
      const existing = characterMap.get(character.id);
      if (existing) {
        existing.count++;
      } else {
        characterMap.set(character.id, { name: character.name, count: 1 });
      }
    }
  }

  const characters = Array.from(characterMap, ([id, { name, count }]) => ({
    id,
    name: `${name} (${count})`,
    count,
  })).sort((a, b) => b.count - a.count);

  return [{ id: ALL_CHARACTER_ID, name: ALL_CHARACTER_NAME, count: 0 }, ...characters];
});

// Filtering and sorting logic for my analyses
const filterAnalysesBySystem = (analyses: AnalysisDocument[], systemId: string) => {
  if (systemId === ALL_SYSTEM_ID) {
    return analyses;
  }
  return analyses.filter((analysis) => analysis.systemId === systemId);
};

const filterAnalysesByCharacter = (analyses: AnalysisDocument[], characterId: string) => {
  if (characterId === ALL_CHARACTER_ID) {
    return analyses;
  }
  return analyses.filter((analysis) => analysis.characterResults.some((character) => character.id === characterId));
};

const sortAnalyses = (analyses: AnalysisDocument[], sortOption: SortOption) => {
  const sorted = [...analyses];

  switch (sortOption) {
    case 'newest':
      return sorted.sort((a, b) => b.sessionDate.toMillis() - a.sessionDate.toMillis());
    case 'oldest':
      return sorted.sort((a, b) => a.sessionDate.toMillis() - b.sessionDate.toMillis());
    case 'deviationScoreDesc':
      return sorted.sort((a, b) => b.primaryDeviationScore - a.primaryDeviationScore);
    case 'deviationScoreAsc':
      return sorted.sort((a, b) => a.primaryDeviationScore - b.primaryDeviationScore);
    default:
      return sorted;
  }
};

export const filteredAndSortedMyAnalysesAtom = atom((get) => {
  const allAnalyses = get(myAnalysesAtom);
  const selectedSystem = get(selectedSystemAtom);
  const selectedCharacter = get(selectedCharacterIdAtom);
  const sortOption = get(sortOptionAtom);

  const filteredBySystem = filterAnalysesBySystem(allAnalyses, selectedSystem);
  const filteredByCharacter = filterAnalysesByCharacter(filteredBySystem, selectedCharacter);
  return sortAnalyses(filteredByCharacter, sortOption);
});
