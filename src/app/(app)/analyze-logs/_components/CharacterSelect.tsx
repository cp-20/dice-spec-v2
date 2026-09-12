'use client';

import type { FC } from 'react';

import { CharacterSelectView } from './CharacterSelectView';
import { useCharacterSelect } from './hooks/useCharacterSelect';
import { useLogAnalysis } from './hooks/useLogAnalysis';

export const CharacterSelect: FC = () => {
  const { character, selectCharacter } = useCharacterSelect();
  const { result } = useLogAnalysis();

  const enabled = result?.type === 'success';
  const characters = enabled ? result.results.map((r) => ({ id: r.id, name: r.name })) : [];

  return (
    <CharacterSelectView
      enabled={enabled}
      characterId={character}
      setCharacterId={selectCharacter}
      characters={characters}
    />
  );
};
