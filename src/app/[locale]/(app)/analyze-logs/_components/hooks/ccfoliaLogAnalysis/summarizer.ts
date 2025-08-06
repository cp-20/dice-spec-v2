import type { MessageParserResult, SystemStats } from './messageParser';

export type DiceResultSummary = {
  // 成功率
  successRate: number;
  // 平均値
  average: number;
  // ダイスロール回数
  diceRollCount: number;
  // 振ったダイスの個数
  diceCount: number;
  // 偏差値
  deviationScore: number;
};

export const summarizeResults = (results: MessageParserResult[], stats: SystemStats): DiceResultSummary => {
  const numberResults = results.flatMap(({ results }) => results);
  const diceRollCount = results.length;
  const diceCount = numberResults.length;

  const successCount = results.filter(({ evaluationStatus }) => evaluationStatus === 'success').length;
  const failureCount = results.filter(({ evaluationStatus }) => evaluationStatus === 'failure').length;
  const successRate = (successCount / (successCount + failureCount)) * 100;

  const average = numberResults.reduce((acc, number) => acc + number, 0) / diceCount;

  const SD = Math.sqrt(stats.variance / diceCount);
  const deviationScore = ((stats.better === 'low' ? -1 : 1) * (average - stats.average) * 10) / SD + 50;

  return { successRate, average, diceRollCount, diceCount, deviationScore };
};
