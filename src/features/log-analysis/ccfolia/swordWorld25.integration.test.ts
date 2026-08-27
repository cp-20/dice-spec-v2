import { analyzeCcfoliaLog } from './index';

const htmlLog = `<!DOCTYPE html>
<html lang="ja">
  <body>
    <p style="color:#4caf50;">
      <span> [main]</span>
      <span>テスト君</span> :
      <span>2d+10&gt;=15 回避力 (2D6+10&gt;=15) ＞ 8[2,6]+10 ＞ 18 ＞ 成功</span>
    </p>
    <p style="color:#4caf50;">
      <span> [main]</span>
      <span>テスト君</span> :
      <span>x2 k20+5 ダメージ #1 KeyNo.20c[10]+5 ＞ 2D:[5,3]=8 ＞ 6+5 ＞ 11 #2 KeyNo.20c[10]+5 ＞ 2D:[6,4 2,3]=10,5 ＞ 8,3+5 ＞ 1回転 ＞ 16</span>
    </p>
  </body>
</html>`;

describe('SW2.5ログ解析', () => {
  test('複数回ロールと威力表の回転を含めて集計する', () => {
    const [allResult, characterResult] = analyzeCcfoliaLog('SwordWorld2.5', htmlLog);

    expect(allResult.results.map((result) => result.results)).toEqual([[8], [8], [10, 5]]);
    expect(allResult.summary).toMatchObject({
      successRate: 100,
      evaluatedRollCount: 1,
      average: 7.75,
      diceRollCount: 3,
      diceCount: 4,
    });
    expect(characterResult.name).toBe('テスト君');
    expect(characterResult.summary).toEqual(allResult.summary);
  });
});
