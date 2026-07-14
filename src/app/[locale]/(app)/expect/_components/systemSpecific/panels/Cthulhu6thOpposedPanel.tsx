'use client';

import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { calculateCthulhu6thOpposedRoll } from '@/features/dice-expectation/system-specific';

import { NumberField, OpposedProbabilityBar, SystemPanel } from '../common';

export const Cthulhu6thOpposedPanel: FC = () => {
  const [active, setActive] = useState(10);
  const [passive, setPassive] = useState(10);
  const result = useMemo(() => calculateCthulhu6thOpposedRoll(active, passive), [active, passive]);
  const activeProbability = result.chance ?? 0;
  const passiveProbability = 1 - activeProbability;

  return (
    <SystemPanel
      title="クトゥルフ神話TRPG: 対抗ロール"
      description="能動側と受動側の能力値から、抵抗表の成功率を計算します。"
      controls={
        <div className="flex flex-wrap gap-3 justify-between">
          <NumberField label="能動側の能力値" min={1} value={active} onChange={setActive} />
          <NumberField label="受動側の能力値" min={1} value={passive} onChange={setPassive} />
        </div>
      }
    >
      <OpposedProbabilityBar
        activeLabel="能動側"
        passiveLabel="受動側"
        activeProbability={activeProbability}
        passiveProbability={passiveProbability}
      />
    </SystemPanel>
  );
};
