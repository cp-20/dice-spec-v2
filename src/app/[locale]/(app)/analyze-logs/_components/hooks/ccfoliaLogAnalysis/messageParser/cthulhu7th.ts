import type { SystemMessageParser, SystemStats } from '.';

// match[1]: 目標値
// match[2]: ボーナス・ペナルティダイスの数
// match[3]: 生のダイス結果
// match[4]: ボーナス・ペナルティダイス適用後のダイス結果
// match[5]: ダイス結果の評価
const CoC7thDiceRollRegex = /\(1D100<=(\d+)\) ボーナス・ペナルティダイス\[(-2|-1|0|1|2)\] ＞ (.+) ＞ (\d+) ＞ (.+)/;

export const CoC7thParser: SystemMessageParser = (message) => {
  const match = message.match(CoC7thDiceRollRegex);
  if (match === null) return null;

  const target = Number.parseInt(match[1], 10);
  // ボーナス・ペナルティダイスがある場合でも最初の結果を取る
  const result = Number.parseInt(match[3], 10);
  const evaluation = match[5];

  return { evaluation, results: [result], target };
};

export const CoC7thSystemStats = {
  average: 50.5,
  variance: 833.25,
  better: 'low',
  pivots: [1, 11, 21, 31, 41, 51, 61, 71, 81, 91, 101],
  evaluations: [
    { label: 'ファンブル', status: 'failure' },
    { label: '失敗', status: 'failure' },
    { label: 'レギュラー成功', status: 'success' },
    { label: 'ハード成功', status: 'success' },
    { label: 'イクストリーム成功', status: 'success' },
    { label: 'クリティカル', status: 'success' },
  ],
} satisfies SystemStats;
