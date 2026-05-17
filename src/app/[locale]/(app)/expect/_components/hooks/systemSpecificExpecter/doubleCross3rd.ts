import type { DistributionResult } from './types';
import { addProbability, clamp, combination, getMean, toRows } from './utils';

export const calculateDoubleCross3rdExplodingDice = (
  diceCount: number,
  criticalValue: number,
  modifier: number,
): DistributionResult => {
  const cappedCriticalValue = clamp(criticalValue, 2, 10);
  const distribution: Record<number, number> = {};
  const queue: { dice: number; scoreBase: number; probability: number }[] = [
    { dice: diceCount, scoreBase: modifier, probability: 1 },
  ];
  const probabilityThreshold = 0.00001;
  const maxScoreBase = 300;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    for (let criticals = 0; criticals <= current.dice; criticals++) {
      const nonCriticals = current.dice - criticals;
      const criticalProbability = ((11 - cappedCriticalValue) / 10) ** criticals;
      const chooseCriticalDice = combination(current.dice, criticals);

      if (nonCriticals === 0) {
        const probability = current.probability * chooseCriticalDice * criticalProbability;

        if (probability < probabilityThreshold) {
          continue;
        }

        if (current.scoreBase >= maxScoreBase) {
          addProbability(distribution, current.scoreBase + 10, probability);
        } else {
          queue.push({ dice: criticals, scoreBase: current.scoreBase + 10, probability });
        }
        continue;
      }

      for (let maxNonCritical = 1; maxNonCritical < cappedCriticalValue; maxNonCritical++) {
        const maxProbability = (maxNonCritical / 10) ** nonCriticals - ((maxNonCritical - 1) / 10) ** nonCriticals;
        const probability = current.probability * chooseCriticalDice * criticalProbability * maxProbability;

        if (criticals > 0) {
          if (probability < probabilityThreshold) {
            continue;
          }

          if (current.scoreBase >= maxScoreBase) {
            addProbability(distribution, current.scoreBase + 10 + maxNonCritical, probability);
          } else {
            queue.push({ dice: criticals, scoreBase: current.scoreBase + 10, probability });
          }
        } else if (probability >= probabilityThreshold) {
          addProbability(distribution, current.scoreBase + maxNonCritical, probability);
        }
      }
    }
  }

  return {
    rows: toRows(distribution),
    mean: getMean(distribution),
    range: {
      min: Math.min(...Object.keys(distribution).map(Number)),
      max: Math.max(...Object.keys(distribution).map(Number)),
    },
  };
};
