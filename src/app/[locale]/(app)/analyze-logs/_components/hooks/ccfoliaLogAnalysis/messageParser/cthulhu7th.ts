import type { MessageParser, MessageParserResult, SystemStats } from '.';

// match[1]: 目標値
// match[2]: ボーナス・ペナルティダイスの数
// match[3]: 生のダイス結果
// match[4]: ボーナス・ペナルティダイス適用後のダイス結果
// match[5]: ダイス結果の評価
const CoC7thDiceRollRegex = /\(1D100<=(\d+)\) ボーナス・ペナルティダイス\[(-2|-1|0|1|2)\] ＞ (.+) ＞ (\d+) ＞ (.+)/;

const evalResult = (result: string): MessageParserResult['evaluationStatus'] => {
  if (['レギュラー成功', 'ハード成功', 'イクストリーム成功', 'クリティカル'].includes(result)) return 'success';
  if (['失敗', 'ファンブル'].includes(result)) return 'failure';
  return 'other';
};

export const CoC7thParser: MessageParser = (message) => {
  const match = message.match(CoC7thDiceRollRegex);
  if (match === null) return null;

  const target = Number.parseInt(match[1], 10);
  // ボーナス・ペナルティダイスがある場合でも最初の結果を取る
  const result = Number.parseInt(match[3], 10);
  const evaluation = match[5];
  const evaluationStatus = evalResult(evaluation);

  return { evaluation, evaluationStatus, results: [result], target };
};

export const CoC7thSystemStats = {
  average: 50.5,
  variance: 833.25,
  better: 'low',
  pivots: [1, 11, 21, 31, 41, 51, 61, 71, 81, 91, 101],
} satisfies SystemStats;
