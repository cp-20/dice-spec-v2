import { useAtom, useAtomValue } from 'jotai';
import type { FC } from 'react';

import { CharacterSelectView } from '../../_components/CharacterSelectView';
import { charactersAtom, selectedCharacterIdAtom } from './atoms';

export const CharacterSelector: FC = () => {
  const characters = useAtomValue(charactersAtom);
  const [selectedCharacterId, setSelectedCharacterId] = useAtom(selectedCharacterIdAtom);

  return (
    <CharacterSelectView
      enabled
      characterId={selectedCharacterId}
      setCharacterId={setSelectedCharacterId}
      characters={characters}
    />
  );
};
