'use client';

import { useAtomValue } from 'jotai';
import type { FC } from 'react';

import { Skeleton } from '@/shared/components/ui/skeleton';

import { NewCharacterCard, SavedCharacterCard } from './SavedCharacterCard';
import { savedCharactersAtom, selectableCharactersAtom } from './savedCharacters';

export const CcfoliaSavedCharacterGrid: FC = () => {
  const charactersLoading = useAtomValue(savedCharactersAtom).loading;
  const selectableCharacters = useAtomValue(selectableCharactersAtom);

  if (charactersLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {selectableCharacters.map((character) => (
        <SavedCharacterCard key={character.id} character={character} />
      ))}
      <NewCharacterCard />
    </div>
  );
};
