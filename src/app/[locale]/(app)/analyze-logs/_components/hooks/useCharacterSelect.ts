import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

export const logAnalysisCharacterAtom = atom<string>('all');

export const useCharacterSelect = () => {
  const [character, setCharacter] = useAtom(logAnalysisCharacterAtom);

  const selectCharacter = useCallback(
    (character: string) => {
      setCharacter(character);
    },
    [setCharacter],
  );

  return {
    character,
    selectCharacter,
  };
};
