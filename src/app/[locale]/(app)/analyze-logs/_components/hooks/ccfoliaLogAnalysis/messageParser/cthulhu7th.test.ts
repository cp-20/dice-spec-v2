import { CoC7thParser } from './cthulhu7th';

describe('CoC7thParser', () => {
  test('単なるメッセージは null を返す', () => {
    expect(CoC7thParser('テスト')).toBe(null);
  });

  test('正常なダイス結果をパースする', () => {
    expect(
      CoC7thParser('CC(-2)<=60 (1D100<=60) ボーナス・ペナルティダイス[-2] ＞ 80, 100, 50 ＞ 100 ＞ ファンブル'),
    ).toStrictEqual({
      evaluation: 'ファンブル',
      evaluationStatus: 'failure',
      results: [80],
      target: 60,
    });

    expect(CoC7thParser('CC<=30 (1D100<=30) ボーナス・ペナルティダイス[0] ＞ 95 ＞ 95 ＞ 失敗')).toStrictEqual({
      evaluation: '失敗',
      evaluationStatus: 'failure',
      results: [95],
      target: 30,
    });

    expect(CoC7thParser('CC(1)<=20 (1D100<=20) ボーナス・ペナルティダイス[1] ＞ 89, 49 ＞ 49 ＞ 失敗')).toStrictEqual({
      evaluation: '失敗',
      evaluationStatus: 'failure',
      results: [89],
      target: 20,
    });

    expect(
      CoC7thParser('CC<=60 (1D100<=60) ボーナス・ペナルティダイス[0] ＞ 45 ＞ 45 ＞ レギュラー成功'),
    ).toStrictEqual({
      evaluation: 'レギュラー成功',
      evaluationStatus: 'success',
      results: [45],
      target: 60,
    });

    expect(CoC7thParser('(9/10) (1D100<=10) ボーナス・ペナルティダイス[0] ＞ 3 ＞ 3 ＞ ハード成功')).toStrictEqual({
      evaluation: 'ハード成功',
      evaluationStatus: 'success',
      results: [3],
      target: 10,
    });

    expect(
      CoC7thParser('CC<=100 (1D100<=100) ボーナス・ペナルティダイス[0] ＞ 17 ＞ 17 ＞ イクストリーム成功'),
    ).toStrictEqual({
      evaluation: 'イクストリーム成功',
      evaluationStatus: 'success',
      results: [17],
      target: 100,
    });

    expect(CoC7thParser('CC<=100 (1D100<=100) ボーナス・ペナルティダイス[0] ＞ 1 ＞ 1 ＞ クリティカル')).toStrictEqual({
      evaluation: 'クリティカル',
      evaluationStatus: 'success',
      results: [1],
      target: 100,
    });
  });
});
