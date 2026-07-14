import type { DiceResultSummary, MessageParserResult, SystemStats } from '@/features/log-analysis/model';

export type { DiceResultSummary } from '@/features/log-analysis/model';

export const summarizeResults = (results: MessageParserResult[], stats: SystemStats): DiceResultSummary => {
  const numberResults = results.flatMap(({ results }) => results);
  const diceRollCount = results.length;
  const diceCount = numberResults.length;

  const successCount = results.filter(({ evaluationStatus }) => evaluationStatus === 'success').length;
  const failureCount = results.filter(({ evaluationStatus }) => evaluationStatus === 'failure').length;
  const evaluatedCount = successCount + failureCount;
  const successRate = evaluatedCount === 0 ? 0 : (successCount / evaluatedCount) * 100;

  const average = numberResults.reduce((acc, number) => acc + number, 0) / diceCount;

  const SD = Math.sqrt(stats.variance / diceCount);
  const deviationScore = ((stats.better === 'low' ? -1 : 1) * (average - stats.average) * 10) / SD + 50;

  return { successRate, average, diceRollCount, diceCount, deviationScore };
};
