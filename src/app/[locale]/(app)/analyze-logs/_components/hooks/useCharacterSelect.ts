import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';
import { ALL_CHARACTER_ID } from '../constants';

export const logAnalysisCharacterAtom = atom<string>(ALL_CHARACTER_ID);

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
