'use client';

import dynamic from 'next/dynamic';
import type { FC } from 'react';

import { useCharacterLogAnalysis } from './hooks/useCharacterLogAnalysis';
import { useCharacterSelect } from './hooks/useCharacterSelect';
import { useLogAnalysisSystem } from './hooks/useLogAnalysis';

const LogAnalysisChartsView = dynamic(
  () => import('./LogAnalysisChartsView').then((mod) => mod.LogAnalysisChartsView),
  { ssr: false, loading: () => <div className="h-75" /> },
);

export const LogAnalysisCharts: FC = () => {
  const { system } = useLogAnalysisSystem();
  const { character } = useCharacterSelect();
  const analysisResult = useCharacterLogAnalysis(character);

  return <LogAnalysisChartsView system={system} records={analysisResult?.results ?? []} />;
};
