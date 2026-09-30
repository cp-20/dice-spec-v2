'use client';

import dynamic from 'next/dynamic';

export const DeferredAnalysisSavePanel = dynamic(
  () => import('./AnalysisSavePanel').then((mod) => mod.AnalysisSavePanel),
  {
    ssr: false,
  },
);
export const DeferredDiceLogSummary = dynamic(() => import('./DiceLogSummary').then((mod) => mod.DiceLogSummary), {
  ssr: false,
});
export const DeferredLogAnalysisShareButton = dynamic(
  () => import('./LogAnalysisShareButton').then((mod) => mod.LogAnalysisShareButton),
  { ssr: false },
);
