import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

const characterAtom = atom<string>('all');

export const useCharacterSelect = () => {
  const [character, setCharacter] = useAtom(characterAtom);

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
