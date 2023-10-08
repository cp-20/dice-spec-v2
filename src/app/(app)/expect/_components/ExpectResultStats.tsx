'use client';

import type { FC, ReactNode } from 'react';
import type { DiceExpecterResult, SuccessExpectResult } from './hooks/expecter';
import { useDiceExpecterResult } from './hooks/useDiceExpecter';
import { Stats } from '@/shared/components/elements/Stats';

const getResultFormatBase =
  (formatter: (result: SuccessExpectResult) => ReactNode) =>
  (result: DiceExpecterResult | null) => {
    if (result === null) return '-';
    if (!result.success) return '-';
    return formatter(result);
  };

const getChanceFormat = getResultFormatBase((result) => {
  if (!result.withTarget) return '-';

  const percent = result.chance * 100;
  return percent.toFixed(3);
});

const getMeanFormat = getResultFormatBase((result) => {
  return result.mean.toFixed(3);
});

const getCIFormat = getResultFormatBase((result) => {
  const min = result.CI.min.toFixed(1);
  const max = result.CI.max.toFixed(1);
  return `${min} - ${max}`;
});

const getSDFormat = getResultFormatBase((result) => {
  return result.SD.toFixed(3);
});

const getVarianceFormat = getResultFormatBase((result) => {
  return result.variance.toFixed(3);
});

const getRangeFormat = getResultFormatBase((result) => {
  const min = result.range.min.toFixed(1);
  const max = result.range.max.toFixed(1);
  return `${min} - ${max}`;
});

export const ExpectResultStats: FC = () => {
  const { result } = useDiceExpecterResult();

  const chance = getChanceFormat(result);

  return (
    <div className="@container">
      <div className="grid gap-2 @[300px]:grid-cols-2 @[400px]:grid-cols-3 @[800px]:grid-cols-6">
        <Stats
          label="確率"
          number={chance}
          unit={chance !== '-' ? '%' : null}
        />
        <Stats label="平均" number={getMeanFormat(result)} />
        <Stats label="信頼区間 (P95)" number={getCIFormat(result)} />
        <Stats label="標準偏差" number={getSDFormat(result)} />
        <Stats label="分散" number={getVarianceFormat(result)} />
        <Stats label="範囲" number={getRangeFormat(result)} />
      </div>
    </div>
  );
};
