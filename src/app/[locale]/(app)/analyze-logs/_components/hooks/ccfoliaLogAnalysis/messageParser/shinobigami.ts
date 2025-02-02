import type { MessageParser, MessageParserResult, SystemStats } from '.';

const evalResult = (result: string): MessageParserResult['evaluationStatus'] => {
  if (['成功', 'スペシャル'].includes(result)) return 'success';
  if (['失敗', 'ファンブル'].includes(result)) return 'failure';
  return 'other';
};

// match[1]: 振ったダイスの数 (optional)
// match[2]: 補正値 (optional)
// match[3]: クリティカル値
// match[4]: ファンブル値
// match[5]: 目標値 (optional)
// match[6]: ダイス結果
// match[7]: 最終結果
// match[8]: 評価 (optional)
const shinobigamiRegex =
  /\((\d*)SG(?:\+(\d+))?@(\d+)#(\d+)(?:>=(\d+))?\)(?: ＞ \[[\d,]+\])? ＞ (\d+)\[[\d,]+\](?:\+\d+)? ＞ (\d+)(?: ＞ (.+?)(?:\(.+\))?)?$/;

export const shinobigamiParser: MessageParser = (message) => {
  const match = message.match(shinobigamiRegex);
  if (match === null) return null;

  const rawTarget = Number.parseInt(match[5], 10);
  const target = Number.isNaN(rawTarget) ? -1 : rawTarget;
  const results = [Number.parseInt(match[6], 10)];
  const evaluation = match[8] ?? '';
  const evaluationStatus = evalResult(evaluation);

  return { evaluation, evaluationStatus, results, target };
};

export const shinobigamiSystemStats = {
  average: 7,
  variance: 5.833333333333333,
  better: 'high',
  pivots: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
} satisfies SystemStats;
