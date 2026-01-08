import { emokloreParser } from './emoklore';

describe('emokloreParser', () => {
  test('単なるメッセージは null を返す', () => {
    expect(emokloreParser('テスト')).toBe(null);
  });

  test('正常なダイス結果をパースする (BCDice <3.5.0)', () => {
    expect(emokloreParser('1DM<=5 (1DM<=5) ＞ [10] ＞ -1 ＞ ファンブル!')).toStrictEqual({
      evaluation: 'ファンブル',
      results: [10],
      target: 5,
    });

    expect(emokloreParser('2DM<=1 (2DM<=1) ＞ [8, 9] ＞ 0 ＞ 失敗!')).toStrictEqual({
      evaluation: '失敗',
      results: [8, 9],
      target: 1,
    });

    expect(emokloreParser('2DM<=7 (2DM<=7) ＞ [1, 10] ＞ 1 ＞ 成功!')).toStrictEqual({
      evaluation: '成功',
      results: [1, 10],
      target: 7,
    });

    expect(emokloreParser('1DM<=7 (1DM<=7) ＞ [1] ＞ 2 ＞ ダブル!')).toStrictEqual({
      evaluation: 'ダブル',
      results: [1],
      target: 7,
    });

    expect(emokloreParser('4DM<=6 (4DM<=6) ＞ [4, 1, 3, 10] ＞ 3 ＞ トリプル!')).toStrictEqual({
      evaluation: 'トリプル',
      results: [4, 1, 3, 10],
      target: 6,
    });
  });

  test('正常なダイス結果をパースする (BCDice >=3.5.0)', () => {
    expect(emokloreParser('1DM<=5 (1DM<=5) ＞ [10] ＞ -1 ＞ 成功数-1 ファンブル!')).toStrictEqual({
      evaluation: 'ファンブル',
      results: [10],
      target: 5,
    });

    expect(emokloreParser('2DM<=1 (2DM<=1) ＞ [8, 9] ＞ 0 ＞ 成功数0 失敗!')).toStrictEqual({
      evaluation: '失敗',
      results: [8, 9],
      target: 1,
    });

    expect(emokloreParser('2DM<=7 (2DM<=7) ＞ [1, 10] ＞ 1 ＞ 成功数1 成功!')).toStrictEqual({
      evaluation: '成功',
      results: [1, 10],
      target: 7,
    });

    expect(emokloreParser('1DM<=7 (1DM<=7) ＞ [1] ＞ 2 ＞ 成功数2 ダブル!')).toStrictEqual({
      evaluation: 'ダブル',
      results: [1],
      target: 7,
    });

    expect(emokloreParser('4DM<=6 (4DM<=6) ＞ [4, 1, 3, 10] ＞ 3 ＞ 成功数3 トリプル!')).toStrictEqual({
      evaluation: 'トリプル',
      results: [4, 1, 3, 10],
      target: 6,
    });
  });
});
