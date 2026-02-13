'use client';

import type { FC } from 'react';
import { useCharacterLogAnalysis } from './hooks/useCharacterLogAnalysis';
import { useCharacterSelect } from './hooks/useCharacterSelect';
import { LogAnalysisRankingChartView } from './LogAnalysisRankingChartView';

interface LogAnalysisRankingChartProps {
  className?: string;
}

export const LogAnalysisRankingChart: FC<LogAnalysisRankingChartProps> = ({ className }) => {
  const { character } = useCharacterSelect();
  const result = useCharacterLogAnalysis(character);

  const score = result ? result.summary.deviationScore : 0;

  return <LogAnalysisRankingChartView score={score} className={className} />;
};
