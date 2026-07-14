'use client';

import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { calculateEmokloreSuccessDistribution } from '@/features/dice-expectation/system-specific';
import { Stats } from '@/shared/components/elements/Stats';
import { round } from '@/shared/lib/round';

import { NumberField, percent, SystemPanel } from '../common';

export const EmoklorePanel: FC = () => {
  const [diceCount, setDiceCount] = useState(2);
  const [target, setTarget] = useState(7);
  const result = useMemo(() => calculateEmokloreSuccessDistribution(diceCount, target), [diceCount, target]);

  return (
    <SystemPanel
      title="エモクロアTRPG: 成功度の分布"
      description="出目1を成功数+2、目標値以下を+1、出目10を-1として、成功度ごとの分布を計算します。"
      controls={
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <NumberField label="ダイス数" min={1} max={20} value={diceCount} onChange={setDiceCount} className="w-full" />
          <NumberField label="目標値" min={1} max={10} value={target} onChange={setTarget} className="w-full" />
        </div>
      }
      result={result}
      stats={
        <div className="grid gap-2 md:grid-cols-3">
          <Stats label="成功率" number={percent(result.chance ?? 0)} unit="%" />
          <Stats label="平均成功数" number={round(result.mean ?? 0, 3)} />
        </div>
      }
    />
  );
};
