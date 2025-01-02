import { parseHtmlLog } from './htmlParser';

const htmlLog = `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>ccfolia - logs</title>
  </head>
  <body>
    


<p style="color:#4caf50;">
  <span> [main]</span>
  <span>テスト君</span> :
  <span>
    にゃっはろ～ 
  </span>
</p>

<p style="color:#4caf50;">
  <span> [main]</span>
  <span>テスト君</span> :
  <span>
    元気？ 
  </span>
</p>

<p style="color:#4caf50;">
  <span> [main]</span>
  <span>テスト君</span> :
  <span>
    1d100 (1D100) ＞ 11
  </span>
</p>

<p style="color:#4caf50;">
  <span> [main]</span>
  <span>テスト君</span> :
  <span>
    1d100&lt;=50 (1D100&lt;=50) ＞ 50 ＞ 成功
  </span>
</p>

<p style="color:#4caf50;">
  <span> [main]</span>
  <span>テスト君</span> :
  <span>
    1d100&lt;=30 (1D100&lt;=30) ＞ 63 ＞ 失敗
  </span>
</p>

<p style="color:#4caf50;">
  <span> [main]</span>
  <span>テスト君</span> :
  <span>
    CC&lt;=70 (1D100&lt;=70) ボーナス・ペナルティダイス[0] ＞ 95 ＞ 95 ＞ 失敗
  </span>
</p>

<p style="color:#4caf50;">
  <span> [main]</span>
  <span>テスト君</span> :
  <span>
    CC&lt;=40 (1D100&lt;=40) ボーナス・ペナルティダイス[0] ＞ 99 ＞ 99 ＞ ファンブル
  </span>
</p>

<p style="color:#4caf50;">
  <span> [main]</span>
  <span>テスト君</span> :
  <span>
    BMR 狂気の発作（リアルタイム）(3) ＞ 暴力衝動：赤い霧が探索者に降り、1D10ラウンドの間、抑えの利かない暴力と破壊を敵味方を問わず周囲に向かって爆発させる。(1D10＞1ラウンド)
  </span>
</p>

  </body>
</html>`;

describe('parseHtmlLog', () => {
  test('work', () => {
    const actual = parseHtmlLog(htmlLog);
    const expected: ReturnType<typeof parseHtmlLog> = [
      { color: '#4caf50', tab: '[main]', character: 'テスト君', message: 'にゃっはろ～' },
      { color: '#4caf50', tab: '[main]', character: 'テスト君', message: '元気？' },
      { color: '#4caf50', tab: '[main]', character: 'テスト君', message: '1d100 (1D100) ＞ 11' },
      { color: '#4caf50', tab: '[main]', character: 'テスト君', message: '1d100<=50 (1D100<=50) ＞ 50 ＞ 成功' },
      { color: '#4caf50', tab: '[main]', character: 'テスト君', message: '1d100<=30 (1D100<=30) ＞ 63 ＞ 失敗' },
      {
        color: '#4caf50',
        tab: '[main]',
        character: 'テスト君',
        message: 'CC<=70 (1D100<=70) ボーナス・ペナルティダイス[0] ＞ 95 ＞ 95 ＞ 失敗',
      },
      {
        color: '#4caf50',
        tab: '[main]',
        character: 'テスト君',
        message: 'CC<=40 (1D100<=40) ボーナス・ペナルティダイス[0] ＞ 99 ＞ 99 ＞ ファンブル',
      },
      {
        color: '#4caf50',
        tab: '[main]',
        character: 'テスト君',
        message:
          'BMR 狂気の発作（リアルタイム）(3) ＞ 暴力衝動：赤い霧が探索者に降り、1D10ラウンドの間、抑えの利かない暴力と破壊を敵味方を問わず周囲に向かって爆発させる。(1D10＞1ラウンド)',
      },
    ];

    expect(actual).toEqual(expected);
  });
});
