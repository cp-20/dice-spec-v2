import type { MessageParser, MessageParserResult, SystemStats } from '.';

// match[1]: 目標値
// match[2]: ダイス結果
// match[3]: ダイス結果の評価
const CoC6thBDiceRollRegex = /\(1D100<=(\d+)\) ＞ (\d+) ＞ (.+)$/;

const evalResult = (result: string): MessageParserResult['evaluationStatus'] => {
  // CC
  if (['成功', 'スペシャル'].includes(result)) return 'success';
  if (['失敗', '致命的失敗'].includes(result)) return 'failure';
  // CCB
  if (['成功', '決定的成功/スペシャル'].includes(result)) return 'success';
  if (['失敗', '致命的失敗'].includes(result)) return 'failure';
  return 'other';
};

export const CoC6thParser: MessageParser = (message) => {
  const match = message.match(CoC6thBDiceRollRegex);
  if (match === null) return null;

  const target = Number.parseInt(match[1], 10);
  const result = Number.parseInt(match[2], 10);
  const evaluation = match[3];
  const evaluationStatus = evalResult(evaluation);

  return { evaluation, evaluationStatus, results: [result], target };
};

export const CoC6thSystemStats = {
  average: 50.5,
  variance: 833.25,
  better: 'low',
  pivots: [1, 11, 21, 31, 41, 51, 61, 71, 81, 91, 101],
} satisfies SystemStats;
