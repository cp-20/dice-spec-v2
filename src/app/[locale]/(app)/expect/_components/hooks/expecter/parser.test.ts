import { ParserError, parseDiceCommand } from './parser';

describe('parseDiceCommand', () => {
  test('単純な数字をパースできる', () => {
    expect(parseDiceCommand('123')).toEqual({ type: 'number', value: 123 });
  });

  test('スペースが含まれている数字をパースできる', () => {
    expect(parseDiceCommand(' 123 ')).toEqual({
      type: 'number',
      value: 123,
    });
  });

  test('タブ文字が含まれている数字をパースできる', () => {
    expect(parseDiceCommand('\t123\t')).toEqual({
      type: 'number',
      value: 123,
    });
  });

  test('ダイスをパースできる', () => {
    expect(parseDiceCommand('1d6')).toEqual({
      type: 'dice',
      num: 1,
      faces: 6,
    });
  });

  test('Dが大文字のダイスをパースできる', () => {
    expect(parseDiceCommand('1D6')).toEqual({
      type: 'dice',
      num: 1,
      faces: 6,
    });
  });

  test('単純な計算式をパースできる', () => {
    expect(parseDiceCommand('1 + 2')).toEqual({
      type: 'operation',
      operator: '+',
      left: { type: 'number', value: 1 },
      right: { type: 'number', value: 2 },
    });
  });

  test('マイナスもパースできる', () => {
    expect(parseDiceCommand('1 - 2')).toEqual({
      type: 'operation',
      operator: '-',
      left: { type: 'number', value: 1 },
      right: { type: 'number', value: 2 },
    });
  });

  test('複雑な計算式をパースできる', () => {
    expect(parseDiceCommand('1 + 2 * 3')).toEqual({
      type: 'operation',
      operator: '+',
      left: { type: 'number', value: 1 },
      right: {
        type: 'operation',
        operator: '*',
        left: { type: 'number', value: 2 },
        right: { type: 'number', value: 3 },
      },
    });
  });

  test('括弧を含む計算式をパースできる', () => {
    expect(parseDiceCommand('(1 + 2) / 3')).toEqual({
      type: 'operation',
      operator: '/',
      left: {
        type: 'operation',
        operator: '+',
        left: { type: 'number', value: 1 },
        right: { type: 'number', value: 2 },
      },
      right: { type: 'number', value: 3 },
    });
  });

  test('ダイスを含む計算式をパースできる', () => {
    expect(parseDiceCommand('1 + 2d6')).toEqual({
      type: 'operation',
      operator: '+',
      left: { type: 'number', value: 1 },
      right: { type: 'dice', num: 2, faces: 6 },
    });
  });

  test('ダイスと括弧を含む計算式をパースできる', () => {
    expect(parseDiceCommand('(1 + 2d3) * 2 + 10d6')).toEqual({
      type: 'operation',
      operator: '+',
      left: {
        type: 'operation',
        operator: '*',
        left: {
          type: 'operation',
          operator: '+',
          left: { type: 'number', value: 1 },
          right: { type: 'dice', num: 2, faces: 3 },
        },
        right: { type: 'number', value: 2 },
      },
      right: { type: 'dice', num: 10, faces: 6 },
    });
  });

  test('比較式をパースできる', () => {
    expect(parseDiceCommand('1 + 2d6 >= 10')).toEqual({
      type: 'comparing',
      expression: {
        type: 'operation',
        operator: '+',
        left: { type: 'number', value: 1 },
        right: { type: 'dice', num: 2, faces: 6 },
      },
      target: 10,
      sign: '>=',
    });
  });

  test('不正な計算式はパースできない', () => {
    expect(() => parseDiceCommand('1 + 1d6 + ')).toThrowError(new ParserError('Invalid expression'));

    expect(() => parseDiceCommand('1 + 2) * 3')).toThrowError(new ParserError('Invalid expression'));

    expect(() => parseDiceCommand('((2 * 2d6) + 3')).toThrowError(new ParserError('Invalid expression'));
  });
});
