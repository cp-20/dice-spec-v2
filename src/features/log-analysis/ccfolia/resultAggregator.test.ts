import type { System } from '../model';
import { aggregateResults } from './resultAggregator';

const diceRange: Record<System, [min: number, max: number]> = {
  CoC6th: [1, 100],
  CoC7th: [1, 100],
  emoklore: [1, 10],
  nechronica: [1, 10],
  shinobigami: [2, 12],
  'SwordWorld2.5': [2, 12],
};

test.each(Object.entries(diceRange) as [System, [number, number]][])(
  '%s の出目は最小値から最大値まで分布に数えられる',
  (system, results) => {
    const { data } = aggregateResults(
      [{ evaluation: '', evaluationStatus: 'other', results, target: -1, skillName: null }],
      system,
    );

    expect(data[0]).toBe(1);
    expect(data[data.length - 1]).toBe(1);
  },
);
