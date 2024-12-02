import type { Operator } from '../type';

export const generate2DArray = (m: number, n: number, val = 0): number[][] => {
  return [...Array(m)].map((_) => Array(n).fill(val));
};

const convertChar = (char: string) => {
  const charCode = char.charCodeAt(0);
  if (charCode > 65281 && charCode < 65370) {
    return String.fromCharCode(charCode - 65248);
  } else {
    return char;
  }
};

export const formatInput = (input: string): string => {
  return input.split('').map(convertChar).join('');
};

export const applyOperatorMap: Record<Operator, (left: number, right: number) => number> = {
  '+': (left, right) => left + right,
  '-': (left, right) => left - right,
  '*': (left, right) => left * right,
  '/': (left, right) => left / right,
};
