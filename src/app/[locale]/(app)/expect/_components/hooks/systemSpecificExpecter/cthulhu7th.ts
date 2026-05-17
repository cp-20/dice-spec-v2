import type { DistributionResult } from './types';
import { addProbability, getMean } from './utils';

const getCthulhu7thD100Distribution = (bonusPenaltyDice: number): Record<number, number> => {
  const extraDice = Math.abs(bonusPenaltyDice);
  const distribution: Record<number, number> = {};
  const probability = 1 / (100 * 10 ** extraDice);

  for (let ones = 0; ones <= 9; ones++) {
    for (let baseTens = 0; baseTens <= 9; baseTens++) {
      const tensCandidates = [baseTens];

      for (let extra = 0; extra < 10 ** extraDice; extra++) {
        let rest = extra;
        const tens = tensCandidates.slice();

        for (let i = 0; i < extraDice; i++) {
          tens.push(rest % 10);
          rest = Math.floor(rest / 10);
        }

        const selectedTens = bonusPenaltyDice >= 0 ? Math.min(...tens) : Math.max(...tens);
        const value = selectedTens === 0 && ones === 0 ? 100 : selectedTens * 10 + ones;
        addProbability(distribution, value, probability);
      }
    }
  }

  return distribution;
};

const getCthulhu7thSuccessLevel = (roll: number, target: number) => {
  if (roll === 1) return 4;
  if (roll <= Math.floor(target / 5)) return 3;
  if (roll <= Math.floor(target / 2)) return 2;
  if (roll <= target) return 1;
  return 0;
};

const cthulhu7thLabels = ['失敗', 'レギュラー成功', 'ハード成功', 'イクストリーム成功', 'クリティカル'];

export const calculateCthulhu7thRoll = (target: number, bonusPenaltyDice: number): DistributionResult => {
  const distribution = getCthulhu7thD100Distribution(bonusPenaltyDice);
  const rows = cthulhu7thLabels.map((label, level) => ({
    label,
    probability: Object.entries(distribution)
      .filter(([roll]) => getCthulhu7thSuccessLevel(Number(roll), target) === level)
      .reduce((acc, [, probability]) => acc + probability, 0),
  }));

  return {
    rows,
    chance: rows.slice(1).reduce((acc, row) => acc + row.probability, 0),
    mean: getMean(distribution),
    range: { min: 1, max: 100 },
  };
};

export const calculateCthulhu7thOpposedRoll = (
  activeTarget: number,
  passiveTarget: number,
  activeBonusPenaltyDice: number,
  passiveBonusPenaltyDice: number,
): DistributionResult => {
  const activeDistribution = getCthulhu7thD100Distribution(activeBonusPenaltyDice);
  const passiveDistribution = getCthulhu7thD100Distribution(passiveBonusPenaltyDice);
  let win = 0;
  let draw = 0;
  let lose = 0;

  for (const [activeRoll, activeProbability] of Object.entries(activeDistribution)) {
    const activeLevel = getCthulhu7thSuccessLevel(Number(activeRoll), activeTarget);

    for (const [passiveRoll, passiveProbability] of Object.entries(passiveDistribution)) {
      const passiveLevel = getCthulhu7thSuccessLevel(Number(passiveRoll), passiveTarget);
      const probability = activeProbability * passiveProbability;

      if (activeLevel > passiveLevel) {
        win += probability;
      } else if (activeLevel < passiveLevel) {
        lose += probability;
      } else if (activeLevel === 0) {
        draw += probability;
      } else if (activeTarget > passiveTarget) {
        win += probability;
      } else if (activeTarget < passiveTarget) {
        lose += probability;
      } else {
        draw += probability;
      }
    }
  }

  return {
    rows: [
      { label: '能動側の勝利', probability: win },
      { label: '引き分け', probability: draw },
      { label: '受動側の勝利', probability: lose },
    ],
    chance: win,
  };
};
