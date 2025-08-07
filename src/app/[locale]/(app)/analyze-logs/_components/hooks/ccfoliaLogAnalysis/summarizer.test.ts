import type { MessageParserResult, SystemStats } from './messageParser';
import { CoC6thSystemStats } from './messageParser/cthulhu6th';
import { summarizeResults } from './summarizer';

describe('summarizeResults', () => {
  test('正しく集計される', () => {
    const results: MessageParserResult[] = [
      { evaluation: '成功', evaluationStatus: 'success', results: [3], target: 50 },
      { evaluation: '成功', evaluationStatus: 'success', results: [25], target: 50 },
      { evaluation: '失敗', evaluationStatus: 'failure', results: [69], target: 50 },
      { evaluation: '成功', evaluationStatus: 'success', results: [34], target: 50 },
      { evaluation: '失敗', evaluationStatus: 'failure', results: [59], target: 50 },
    ];
    const stats: SystemStats = CoC6thSystemStats;

    const summary = summarizeResults(results, stats);
    expect(summary).toEqual({
      successRate: 60,
      average: 38,
      diceRollCount: 5,
      diceCount: 5,
      deviationScore: ((stats.average - 38) * 10) / Math.sqrt(stats.variance / 5) + 50,
    });
  });
});
