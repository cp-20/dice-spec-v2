'use client';

import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { Stats } from '@/shared/components/elements/Stats';
import { round } from '@/shared/lib/round';

import {
  calculateDoubleCross3rdExplodingDice,
  type DistributionResult,
} from '@/features/dice-expectation/system-specific';
import { detailedPercent, NumberField, percent, ProbabilityBars, SystemPanel } from '../common';

const collapseSmallTail = (result: DistributionResult): DistributionResult => {
  const threshold = 0.0001;
  let tailProbability = 0;
  let tailStartIndex: number | null = null;

  for (let i = result.rows.length - 1; i >= 0; i--) {
    const nextTailProbability = tailProbability + result.rows[i].probability;
    if (nextTailProbability >= threshold) break;

    tailProbability = nextTailProbability;
    tailStartIndex = i;
  }

  if (tailStartIndex === null) return result;

  const tailStartValue = Number(result.rows[tailStartIndex].label);
  const label = Number.isFinite(tailStartValue) ? `${tailStartValue - 1}>` : result.rows[tailStartIndex].label;

  return {
    ...result,
    rows: [...result.rows.slice(0, tailStartIndex), { label, probability: tailProbability }],
  };
};

export const DoubleCross3rdPanel: FC = () => {
  const [diceCount, setDiceCount] = useState(5);
  const [criticalValue, setCriticalValue] = useState(10);
  const [modifier, setModifier] = useState(0);
  const [target, setTarget] = useState(20);
  const result = useMemo(
    () => calculateDoubleCross3rdExplodingDice(diceCount, criticalValue, modifier),
    [criticalValue, diceCount, modifier],
  );
  const displayResult = useMemo(() => collapseSmallTail(result), [result]);
  const chance = result.rows
    .filter((row) => Number(row.label) >= target)
    .reduce((acc, row) => acc + row.probability, 0);

  return (
    <SystemPanel
      title="ダブルクロス The 3rd Edition: クリティカル"
      description="指定したダイス数とクリティカル値で、振り足しを含めた達成値の分布を計算します。極端な高達成値の尾は微小確率として丸めています。"
      controls={
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <NumberField label="ダイス数" min={1} max={40} value={diceCount} onChange={setDiceCount} className="w-full" />
          <NumberField
            label="クリティカル値"
            min={2}
            max={10}
            value={criticalValue}
            onChange={setCriticalValue}
            className="w-full"
          />
          <NumberField label="修正値" value={modifier} onChange={setModifier} className="w-full" />
          <NumberField label="目標値" value={target} onChange={setTarget} className="w-full" />
        </div>
      }
      result={result}
      stats={
        <div className="grid gap-2 md:grid-cols-3">
          <Stats label="達成率" number={percent(chance)} unit="%" />
          <Stats label="平均達成値" number={round(result.mean ?? 0, 3)} />
          <Stats label="範囲" number={`${result.range?.min} - ${result.range?.max}`} />
        </div>
      }
    >
      <ProbabilityBars result={displayResult} formatPercent={detailedPercent} />
    </SystemPanel>
  );
};
