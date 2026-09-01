import { expect, test } from 'bun:test';

import { numberFormatter } from './variableFieldChangeHandler';

test('数値入力は整数部分だけを解釈する', () => {
  expect(numberFormatter('1e3')).toBe(1);
  expect(numberFormatter('-2.5')).toBe(-2);
  expect(numberFormatter('')).toBeUndefined();
});
