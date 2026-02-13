'use client';

import type { FC } from 'react';
import { DiceLogListView } from './DiceLogListView';
import { useCharacterLogAnalysis } from './hooks/useCharacterLogAnalysis';
import { useCharacterSelect } from './hooks/useCharacterSelect';

export const DiceLogList: FC = () => {
  const { character } = useCharacterSelect();
  const result = useCharacterLogAnalysis(character);

  return <DiceLogListView results={result?.results} />;
};
