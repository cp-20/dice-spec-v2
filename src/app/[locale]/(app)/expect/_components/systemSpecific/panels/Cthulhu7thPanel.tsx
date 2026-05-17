'use client';

import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { Stats } from '@/shared/components/elements/Stats';
import { round } from '@/shared/lib/round';

import { calculateCthulhu7thOpposedRoll, calculateCthulhu7thRoll } from '../../hooks/systemSpecificExpecter';
import { BonusPenaltySelect, NumberField, OpposedProbabilityBar, percent, SystemPanel } from '../common';

export const Cthulhu7thPanel: FC = () => {
  const [activeTarget, setActiveTarget] = useState(60);
  const [passiveTarget, setPassiveTarget] = useState(50);
  const [activeBonusPenaltyDice, setActiveBonusPenaltyDice] = useState(0);
  const [passiveBonusPenaltyDice, setPassiveBonusPenaltyDice] = useState(0);
  const [singleTarget, setSingleTarget] = useState(60);
  const [singleBonusPenaltyDice, setSingleBonusPenaltyDice] = useState(0);
  const opposedResult = useMemo(
    () => calculateCthulhu7thOpposedRoll(activeTarget, passiveTarget, activeBonusPenaltyDice, passiveBonusPenaltyDice),
    [activeTarget, passiveTarget, activeBonusPenaltyDice, passiveBonusPenaltyDice],
  );
  const activeWinProbability = opposedResult.rows.find((row) => row.label === '能動側の勝利')?.probability ?? 0;
  const drawProbability = opposedResult.rows.find((row) => row.label === '引き分け')?.probability ?? 0;
  const passiveWinProbability = opposedResult.rows.find((row) => row.label === '受動側の勝利')?.probability ?? 0;
  const singleResult = useMemo(
    () => calculateCthulhu7thRoll(singleTarget, singleBonusPenaltyDice),
    [singleTarget, singleBonusPenaltyDice],
  );

  return (
    <div className="space-y-5">
      <SystemPanel
        title="新クトゥルフ神話TRPG: 対抗ロール"
        description="成功度を比較し、同じ成功度なら技能値が高い側を勝ちとして計算します。両者失敗、または同技能値の同成功度は引き分けです。"
        controls={
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-wrap gap-3">
              <NumberField label="能動側の技能値" min={1} max={100} value={activeTarget} onChange={setActiveTarget} />
              <BonusPenaltySelect
                label="能動側の補正"
                value={activeBonusPenaltyDice}
                onChange={setActiveBonusPenaltyDice}
              />
            </div>
            <div className="flex flex-wrap gap-3 justify-end">
              <NumberField label="受動側の技能値" min={1} max={100} value={passiveTarget} onChange={setPassiveTarget} />
              <BonusPenaltySelect
                label="受動側の補正"
                value={passiveBonusPenaltyDice}
                onChange={setPassiveBonusPenaltyDice}
              />
            </div>
          </div>
        }
      >
        <OpposedProbabilityBar
          activeLabel="能動側"
          passiveLabel="受動側"
          activeProbability={activeWinProbability}
          passiveProbability={passiveWinProbability}
          drawProbability={drawProbability}
        />
      </SystemPanel>

      <SystemPanel
        title="新クトゥルフ神話TRPG: ボーナス・ペナルティダイス"
        description="ボーナス/ペナルティダイス込みの1D100について、成功度ごとの分布を計算します。"
        controls={
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <NumberField
              label="技能値"
              min={1}
              max={100}
              value={singleTarget}
              onChange={setSingleTarget}
              className="w-full"
            />
            <BonusPenaltySelect
              label="補正"
              value={singleBonusPenaltyDice}
              onChange={setSingleBonusPenaltyDice}
              fullWidth
            />
          </div>
        }
        result={singleResult}
        stats={
          <div className="grid gap-2 md:grid-cols-3">
            <Stats label="成功率" number={percent(singleResult.chance ?? 0)} unit="%" />
            <Stats label="平均" number={round(singleResult.mean ?? 0, 3)} />
          </div>
        }
      />
    </div>
  );
};
