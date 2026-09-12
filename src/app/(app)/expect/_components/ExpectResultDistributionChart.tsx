'use client';

import dynamic from 'next/dynamic';
import type { FC } from 'react';

import type { DiceExpecterResult } from '@/features/dice-expectation/expecter';

import { useDiceExpecterResult } from './hooks/useDiceExpecter';

const ExpectResultDistributionChartView = dynamic(
  () => import('./ExpectResultDistributionChartView').then((mod) => mod.ExpectResultDistributionChartView),
  { ssr: false, loading: () => <div className="h-75" /> },
);

export const ExpectResultDistributionChart: FC = () => {
  const { result } = useDiceExpecterResult();

  if (!result?.success) return null;

  return <ExpectResultDistributionChartView result={result} />;
};

type PresentationalProps = {
  result: DiceExpecterResult;
};

export const PreDefinedExpectResultDistributionChart: FC<PresentationalProps> = ({ result }) => {
  if (!result.success) return null;
  return <ExpectResultDistributionChartView result={result} />;
};
