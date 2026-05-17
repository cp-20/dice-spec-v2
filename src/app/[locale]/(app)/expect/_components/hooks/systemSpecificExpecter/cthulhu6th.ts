import type { DistributionResult } from './types';
import { clamp } from './utils';

export const calculateCthulhu6thOpposedRoll = (active: number, passive: number): DistributionResult => {
  const target = clamp(50 + (active - passive) * 5, 5, 95);
  const success = target / 100;

  return {
    rows: [
      { label: '成功', probability: success },
      { label: '失敗', probability: 1 - success },
    ],
    chance: success,
  };
};
