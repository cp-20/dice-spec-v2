import { bench } from 'vitest';
import { diceExpecter } from '.';

describe('通常のダイスの計算式', () => {
  bench('1d6', () => void diceExpecter('1d6'));
  bench('1d6 + 1d6 + 3', () => void diceExpecter('1d6 + 1d6 - 3'));
  bench('1d6 * 1d6 * 2 + 5', () => void diceExpecter('1d6 * 1d6 * 2 + 5'));
  bench('3d6 + 1d100 + 1', () => void diceExpecter('3d6 + 1d100 + 1'));
  bench('6 - 1d6', () => void diceExpecter('6-1d6'));
  bench('3 + 5d >= 15', () => void diceExpecter('3 + 5d >= 15'));
  bench('3 + 5d <= 14', () => void diceExpecter('3 + 5d <= 14'));
  bench('1d6 >= 8', () => void diceExpecter('1d6 >= 8'));
});
