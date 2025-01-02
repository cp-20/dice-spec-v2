import type { MessageParserResult, SystemStats } from './messageParser';

export type DiceResultSummary = {
  // 成功率
  successRate: number;
  // 平均値
  average: number;
  // ダイスロール回数
  diceRollCount: number;
  // 偏差値
  deviationScore: number;
};

export const summarizeResults = (results: MessageParserResult[], stats: SystemStats): DiceResultSummary => {
  const diceRollCount = results.length;
  const numberResults = results.map(({ result }) => result);

  const successCount = results.filter(({ evaluationStatus }) => evaluationStatus === 'success').length;
  const successRate = (successCount / diceRollCount) * 100;

  const average = numberResults.reduce((acc, number) => acc + number, 0) / diceRollCount;

  const SD = Math.sqrt(stats.variance / diceRollCount);
  const deviationScore = ((stats.better === 'low' ? -1 : 1) * (average - stats.average) * 10) / SD + 50;

  return { successRate, average, diceRollCount, deviationScore };
};
