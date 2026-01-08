import { shinobigamiParser } from './shinobigami';

describe('shinobigamiParser', () => {
  test('単なるメッセージは null を返す', () => {
    expect(shinobigamiParser('テスト')).toBe(null);
  });

  test('正常なダイス結果をパースする', () => {
    expect(shinobigamiParser('SG>=5 (SG@12#2>=5) ＞ 3[1,2] ＞ 3 ＞ 失敗')).toStrictEqual({
      evaluation: '失敗',
      results: [3],
      target: 5,
    });

    expect(shinobigamiParser('SG (SG@12#2) ＞ 11[5,6] ＞ 11')).toStrictEqual({
      evaluation: '',
      results: [11],
      target: -1,
    });

    expect(
      shinobigamiParser(
        '10SG+1>=6 (10SG+1@12#2>=6) ＞ [1,2,2,3,3,3,4,4,6,6] ＞ 12[6,6]+1 ＞ 13 ＞ スペシャル(【生命力】1点か変調一つを回復)',
      ),
    ).toStrictEqual({
      evaluation: 'スペシャル',
      results: [12],
      target: 6,
    });

    expect(shinobigamiParser('SG>=6 (SG@12#2>=6) ＞ 8[2,6] ＞ 8 ＞ 成功')).toStrictEqual({
      evaluation: '成功',
      results: [8],
      target: 6,
    });
  });
});
