'use client';

import type { FC } from 'react';
import { useCharacterLogAnalysis } from './hooks/useCharacterLogAnalysis';
import { useCharacterSelect } from './hooks/useCharacterSelect';
import { useLogAnalysisSystem } from './hooks/useLogAnalysis';
import { useLogAnalysisSystemStats } from './hooks/useLogAnalysisSystemStats';
import { LogAnalysisChartsView } from './LogAnalysisChartsView';

export const LogAnalysisCharts: FC = () => {
  const systemStats = useLogAnalysisSystemStats();
  const { system } = useLogAnalysisSystem();
  const { character } = useCharacterSelect();
  const analysisResult = useCharacterLogAnalysis(character);

  if (analysisResult === undefined) return null;
  if (system === null || systemStats === null) return null;

  return <LogAnalysisChartsView system={system} records={analysisResult.results} />;
};
