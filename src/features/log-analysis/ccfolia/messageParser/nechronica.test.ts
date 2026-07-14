import { nechronicaParser } from './nechronica';

describe('nechronicaParser', () => {
  test('単なるメッセージは null を返す', () => {
    expect(nechronicaParser('テスト')).toBe(null);
  });

  test('行動判定をパースする', () => {
    expect(nechronicaParser('1NC 【対話】 (1NC) ＞ [8] ＞ 8[8] ＞ 成功')).toStrictEqual({
      evaluation: '成功',
      results: [8],
      target: 6,
      skillName: '対話',
    });

    expect(nechronicaParser('NC 観察 (NC) ＞ [1] ＞ 1[1] ＞ 大失敗')).toStrictEqual({
      evaluation: '大失敗',
      results: [1],
      target: 6,
      skillName: '観察',
    });

    expect(nechronicaParser('1NC+2 (1NC+2) ＞ [10]+2 ＞ 12[12] ＞ 大成功')).toStrictEqual({
      evaluation: '大成功',
      results: [10],
      target: 6,
      skillName: null,
    });
  });

  test('攻撃判定をパースする', () => {
    expect(
      nechronicaParser('1NA+2 【ショットガン】 (1NA+2) ＞ [6]+2 ＞ 8[8] ＞ 成功 ＞ 胴（なければ攻撃側任意）'),
    ).toStrictEqual({
      evaluation: '成功',
      results: [6],
      target: 6,
      skillName: 'ショットガン',
    });

    expect(nechronicaParser('1NA-1 (1NA-1) ＞ [1]-1 ＞ 0[0] ＞ 大失敗')).toStrictEqual({
      evaluation: '大失敗',
      results: [1],
      target: 6,
      skillName: null,
    });
  });

  test('複数ダイスをパースする', () => {
    expect(nechronicaParser('4NC-1 (4NC-1) ＞ [2,2,3,9]-1 ＞ 8[1,1,2,8] ＞ 成功')).toStrictEqual({
      evaluation: '成功',
      results: [2, 2, 3, 9],
      target: 6,
      skillName: null,
    });
  });

  test('旧型式の行動判定をパースする', () => {
    expect(nechronicaParser('1NA+1 (1R10+1[1]) ＞ [7]+1 ＞ 8[8] ＞ 成功 ＞ 胴（なければ攻撃側任意）')).toStrictEqual({
      evaluation: '成功',
      results: [7],
      target: 6,
      skillName: null,
    });
  });
});
