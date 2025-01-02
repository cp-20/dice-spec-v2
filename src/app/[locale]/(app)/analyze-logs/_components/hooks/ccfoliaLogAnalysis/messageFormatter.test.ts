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
});
