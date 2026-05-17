import type { DistributionResult } from './types';
import { addProbability, getMean } from './utils';

const getEmokloreEvaluationLabel = (successCount: number) => {
  if (successCount < 0) return 'ファンブル';
  if (successCount === 0) return '失敗';
  if (successCount === 1) return '成功';
  if (successCount === 2) return 'ダブル';
  if (successCount === 3) return 'トリプル';
  if (successCount === 4) return 'ミラクル';
  return 'カタストロフ';
};

export const calculateEmokloreSuccessDistribution = (diceCount: number, target: number): DistributionResult => {
  let distribution: Record<number, number> = { 0: 1 };

  for (let i = 0; i < diceCount; i++) {
    const next: Record<number, number> = {};

    for (const [successCount, currentProbability] of Object.entries(distribution)) {
      for (let roll = 1; roll <= 10; roll++) {
        const contribution = roll === 10 ? -1 : roll === 1 ? 2 : roll <= target ? 1 : 0;
        addProbability(next, Number(successCount) + contribution, currentProbability / 10);
      }
    }

    distribution = next;
  }

  const grouped = Object.entries(distribution).reduce<Record<string, number>>((acc, [successCount, probability]) => {
    const label = getEmokloreEvaluationLabel(Number(successCount));
    acc[label] = (acc[label] ?? 0) + probability;
    return acc;
  }, {});

  const labelOrder = ['ファンブル', '失敗', '成功', 'ダブル', 'トリプル', 'ミラクル', 'カタストロフ'];

  return {
    rows: labelOrder.map((label) => ({ label, probability: grouped[label] ?? 0 })),
    chance: Object.entries(distribution)
      .filter(([successCount]) => Number(successCount) > 0)
      .reduce((acc, [, probability]) => acc + probability, 0),
    mean: getMean(distribution),
    range: {
      min: Math.min(...Object.keys(distribution).map(Number)),
      max: Math.max(...Object.keys(distribution).map(Number)),
    },
  };
};
