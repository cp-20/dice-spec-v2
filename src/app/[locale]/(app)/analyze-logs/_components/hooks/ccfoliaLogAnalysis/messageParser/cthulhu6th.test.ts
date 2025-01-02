import { CoC6thParser } from './cthulhu6th';

describe('CoC6thParser', () => {
  test('単なるメッセージは null を返す', () => {
    expect(CoC6thParser('テスト')).toBe(null);
  });

  test('正常なダイス結果をパースする', () => {
    expect(CoC6thParser('CCB<=30 (1D100<=30) ＞ 3 ＞ 決定的成功/スペシャル')).toStrictEqual({
      evaluation: '決定的成功/スペシャル',
      evaluationStatus: 'success',
      results: [3],
      target: 30,
    });

    expect(CoC6thParser('CC<=30 (1D100<=30) ＞ 80 ＞ 失敗')).toStrictEqual({
      evaluation: '失敗',
      evaluationStatus: 'failure',
      results: [80],
      target: 30,
    });

    expect(CoC6thParser('CC<=50 (1D100<=50) ＞ 10 ＞ スペシャル')).toStrictEqual({
      evaluation: 'スペシャル',
      evaluationStatus: 'success',
      results: [10],
      target: 50,
    });

    expect(CoC6thParser('CCB<=70 (1D100<=70) ＞ 98 ＞ 致命的失敗')).toStrictEqual({
      evaluation: '致命的失敗',
      evaluationStatus: 'failure',
      results: [98],
      target: 70,
    });

    expect(CoC6thParser('(1/2) CCB<=60 (1D100<=60) ＞ 53 ＞ 成功')).toStrictEqual({
      evaluation: '成功',
      evaluationStatus: 'success',
      results: [53],
      target: 60,
    });
  });
});
