'use client';

import dynamic from 'next/dynamic';
import type { FC, ReactNode } from 'react';

import { useLogAnalysis } from './hooks/useLogAnalysis';

const AnalysisSavePanel = dynamic(() => import('./AnalysisSavePanel').then((mod) => mod.AnalysisSavePanel), {
  ssr: false,
});
const DiceLogSummary = dynamic(() => import('./DiceLogSummary').then((mod) => mod.DiceLogSummary), { ssr: false });
const LogAnalysisShareButton = dynamic(
  () => import('./LogAnalysisShareButton').then((mod) => mod.LogAnalysisShareButton),
  { ssr: false },
);

const AfterSuccessfulAnalysis: FC<{ children: ReactNode }> = ({ children }) => {
  const { result } = useLogAnalysis();
  return result?.type === 'success' ? children : null;
};

export const DeferredAnalysisSavePanel = () => (
  <AfterSuccessfulAnalysis>
    <AnalysisSavePanel />
  </AfterSuccessfulAnalysis>
);

export const DeferredDiceLogSummary = () => (
  <AfterSuccessfulAnalysis>
    <DiceLogSummary />
  </AfterSuccessfulAnalysis>
);

export const DeferredLogAnalysisShareButton = () => (
  <AfterSuccessfulAnalysis>
    <LogAnalysisShareButton />
  </AfterSuccessfulAnalysis>
);
