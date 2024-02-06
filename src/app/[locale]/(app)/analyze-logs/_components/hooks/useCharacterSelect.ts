import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

const characterAtom = atom<string | undefined>(undefined);

export const useCharacterSelect = () => {
  const [character, setCharacter] = useAtom(characterAtom);

  const selectCharacter = useCallback(
    (character: string) => {
      setCharacter(character);
    },
    [setCharacter],
  );

  const clearCharacter = useCallback(() => {
    setCharacter(undefined);
  }, [setCharacter]);

  return {
    character,
    selectCharacter,
    clearCharacter,
  };
};
