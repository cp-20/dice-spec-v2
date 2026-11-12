import { useAtom } from 'jotai';

import { logAnalysisCharacterAtom } from './useLogAnalysis';

export const useCharacterSelect = () => {
  const [character, selectCharacter] = useAtom(logAnalysisCharacterAtom);

  return {
    character,
    selectCharacter,
  };
};
