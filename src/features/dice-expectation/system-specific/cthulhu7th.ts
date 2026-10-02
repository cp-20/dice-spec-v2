import type { DistributionResult } from './types';
import { getMean } from './utils';

const MAX_EXTRA_DICE = 2;
const getCthulhu7thD100Distribution = (bonusPenaltyDice: number): Record<number, number> => {
  if (!Number.isInteger(bonusPenaltyDice) || Math.abs(bonusPenaltyDice) > MAX_EXTRA_DICE) {
    throw new RangeError(`bonusPenaltyDice must be an integer between -${MAX_EXTRA_DICE} and ${MAX_EXTRA_DICE}`);
  }
  const extraDice = Math.abs(bonusPenaltyDice);
  const distribution: Record<number, number> = {};
  const diceCount = extraDice + 1;

  for (let tens = 0; tens <= 9; tens++) {
    // 最小値・最大値の累積確率の差から、選択される十の位の確率を求める。
    const count =
      bonusPenaltyDice >= 0
        ? (10 - tens) ** diceCount - (9 - tens) ** diceCount
        : (tens + 1) ** diceCount - tens ** diceCount;
    const probability = count / (100 * 10 ** extraDice);
    for (let ones = 0; ones <= 9; ones++) {
      const value = tens === 0 && ones === 0 ? 100 : tens * 10 + ones;
      distribution[value] = probability;
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

const getSuccessLevelProbabilities = (distribution: Record<number, number>, target: number): number[] => {
  const probabilities = Array<number>(cthulhu7thLabels.length).fill(0);
  for (const [roll, probability] of Object.entries(distribution)) {
    probabilities[getCthulhu7thSuccessLevel(Number(roll), target)] += probability;
  }
  return probabilities;
};

export const calculateCthulhu7thRoll = (target: number, bonusPenaltyDice: number): DistributionResult => {
  const distribution = getCthulhu7thD100Distribution(bonusPenaltyDice);
  const probabilities = getSuccessLevelProbabilities(distribution, target);
  const rows = cthulhu7thLabels.map((label, level) => ({
    label,
    probability: probabilities[level],
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
  const activeProbabilities = getSuccessLevelProbabilities(
    getCthulhu7thD100Distribution(activeBonusPenaltyDice),
    activeTarget,
  );
  const passiveProbabilities = getSuccessLevelProbabilities(
    getCthulhu7thD100Distribution(passiveBonusPenaltyDice),
    passiveTarget,
  );
  let win = 0;
  let draw = 0;
  let lose = 0;

  for (let activeLevel = 0; activeLevel < activeProbabilities.length; activeLevel++) {
    for (let passiveLevel = 0; passiveLevel < passiveProbabilities.length; passiveLevel++) {
      const probability = activeProbabilities[activeLevel] * passiveProbabilities[passiveLevel];

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
