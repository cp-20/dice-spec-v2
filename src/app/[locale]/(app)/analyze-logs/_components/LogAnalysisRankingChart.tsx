'use client';

import dynamic from 'next/dynamic';
import type { FC } from 'react';

import { useCharacterLogAnalysis } from './hooks/useCharacterLogAnalysis';
import { useCharacterSelect } from './hooks/useCharacterSelect';
const LogAnalysisRankingChartView = dynamic(
  () => import('./LogAnalysisRankingChartView').then((mod) => mod.LogAnalysisRankingChartView),
  { ssr: false, loading: () => <div className="h-75" /> },
);

interface LogAnalysisRankingChartProps {
  className?: string;
}

export const LogAnalysisRankingChart: FC<LogAnalysisRankingChartProps> = ({ className }) => {
  const { character } = useCharacterSelect();
  const result = useCharacterLogAnalysis(character);

  if (!result) return <div className="h-75" />;

  return <LogAnalysisRankingChartView score={result.summary.deviationScore} className={className} />;
};
