import type { DistributionResult } from './types';
import { addProbability, clamp, combination, getMean, toRows } from './utils';

export const calculateDoubleCross3rdExplodingDice = (
  diceCount: number,
  criticalValue: number,
  modifier: number,
): DistributionResult => {
  if (!Number.isInteger(diceCount) || diceCount <= 0) {
    throw new RangeError('diceCount must be a positive integer');
  }
  const cappedCriticalValue = clamp(criticalValue, 2, 10);
  const criticalChance = (11 - cappedCriticalValue) / 10;
  const exact: Record<number, number> = {};
  // 振り足すダイス数ごとに確率をまとめて進める。経路ごとに展開すると状態が指数的に増え、
  // 個々の経路を微小確率として捨てると合計が1から大きく外れる。
  let rerolls = new Map([[diceCount, 1]]);
  let remaining = 1;

  for (let round = 0; remaining > 1e-12; round++) {
    const scoreBase = modifier + round * 10;
    const nextRerolls = new Map<number, number>();
    remaining = 0;

    for (const [dice, probability] of rerolls) {
      for (let max = 1; max < cappedCriticalValue; max++) {
        addProbability(exact, scoreBase + max, probability * ((max / 10) ** dice - ((max - 1) / 10) ** dice));
      }
      for (let criticals = 1; criticals <= dice; criticals++) {
        const next =
          probability *
          combination(dice, criticals) *
          criticalChance ** criticals *
          (1 - criticalChance) ** (dice - criticals);
        nextRerolls.set(criticals, (nextRerolls.get(criticals) ?? 0) + next);
        remaining += next;
      }
    }
    rerolls = nextRerolls;
  }

  // 表示する分布と範囲からは、ほぼ起こらない達成値を除く。平均は除く前の分布から求める。
  const distribution = Object.fromEntries(Object.entries(exact).filter(([, probability]) => probability >= 0.00001));

  return {
    rows: toRows(distribution),
    mean: getMean(exact),
    range: {
      min: Math.min(...Object.keys(distribution).map(Number)),
      max: Math.max(...Object.keys(distribution).map(Number)),
    },
  };
};
