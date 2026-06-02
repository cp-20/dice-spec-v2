import { formatMessage } from './messageFormatter';

describe('formatMessage', () => {
  test('"x<number> " が含まれてなければそのまま', () => {
    const message = 'This is a normal message';
    expect(formatMessage(message)).toEqual([message]);
  });

  test('"x<number> " が含まれていれば分割', () => {
    const message = `x2 1d100 #1
(1D100) ＞ 38

#2
(1D100) ＞ 94`;
    expect(formatMessage(message)).toEqual(['(1/2) 1d100 (1D100) ＞ 38', '(2/2) 1d100 (1D100) ＞ 94']);
  });

  test('"sx<number> " が含まれていればシークレットの複数回ロールとして分割', () => {
    const message = 'sx2 CCB<=30 【拳銃】 #1 (1D100<=30) ＞ 5 ＞ 決定的成功/スペシャル #2 (1D100<=30) ＞ 12 ＞ 成功';

    expect(formatMessage(message)).toEqual([
      '(1/2) CCB<=30 【拳銃】 (1D100<=30) ＞ 5 ＞ 決定的成功/スペシャル',
      '(2/2) CCB<=30 【拳銃】 (1D100<=30) ＞ 12 ＞ 成功',
    ]);
  });
});
