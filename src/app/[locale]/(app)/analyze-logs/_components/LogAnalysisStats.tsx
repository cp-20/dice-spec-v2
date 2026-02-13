'use client';

import type { FC } from 'react';
import { useCharacterLogAnalysis } from './hooks/useCharacterLogAnalysis';
import { useCharacterSelect } from './hooks/useCharacterSelect';
import { LogAnalysisStatsView } from './LogAnalysisStatsView';

export const LogAnalysisStats: FC = () => {
  const { character } = useCharacterSelect();
  const result = useCharacterLogAnalysis(character);

  return <LogAnalysisStatsView result={result} />;
};
