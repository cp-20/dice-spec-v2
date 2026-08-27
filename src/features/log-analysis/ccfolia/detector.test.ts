import { detectSystem } from './detector';

const htmlLog = (message: string) => `<!DOCTYPE html>
<html lang="ja">
  <body>
    <p style="color:#4caf50;">
      <span> [main]</span>
      <span>テスト君</span> :
      <span>${message}</span>
    </p>
  </body>
</html>`;

describe('detectSystem', () => {
  test('威力表があるログをSW2.5と判定する', () => {
    expect(detectSystem(htmlLog('K20 KeyNo.20c[10] ＞ 2D:[5,3]=8 ＞ 6'))).toBe('SwordWorld2.5');
  });

  test('一般的な2D6だけでSW2.5と誤判定しない', () => {
    expect(detectSystem(htmlLog('(2D6+10&gt;=15) ＞ 8[2,6]+10 ＞ 18 ＞ 成功'))).toBe(null);
  });

  test('有効なダイスログがなければ null を返す', () => {
    expect(detectSystem(htmlLog('普通の会話ログ'))).toBe(null);
  });
});
