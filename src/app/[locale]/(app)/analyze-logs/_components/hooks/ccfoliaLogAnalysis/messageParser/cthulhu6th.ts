import type { SystemMessageParser, SystemStats } from '.';

// match[1]: 目標値
// match[2]: ダイス結果
// match[3]: ダイス結果の評価
const CoC6thBDiceRollRegex = /\(1D100<=(\d+)\) ＞ (\d+) ＞ (.+)$/;

const normalizeEvaluation = (evaluation: string): string => {
  // CCBの「決定的成功/スペシャル」をCCの「スペシャル」に変換
  if (evaluation === '決定的成功/スペシャル') return 'スペシャル';
  return evaluation;
};

export const CoC6thParser: SystemMessageParser = (message) => {
  const match = message.match(CoC6thBDiceRollRegex);
  if (match === null) return null;

  const target = Number.parseInt(match[1], 10);
  const result = Number.parseInt(match[2], 10);
  const evaluation = normalizeEvaluation(match[3]);

  return { evaluation, results: [result], target };
};

export const CoC6thSystemStats = {
  average: 50.5,
  variance: 833.25,
  better: 'low',
  pivots: [1, 11, 21, 31, 41, 51, 61, 71, 81, 91, 101],
  evaluations: [
    { label: '致命的失敗', status: 'failure' },
    { label: '失敗', status: 'failure' },
    { label: '成功', status: 'success' },
    { label: 'スペシャル', status: 'success' },
  ],
} satisfies SystemStats;
