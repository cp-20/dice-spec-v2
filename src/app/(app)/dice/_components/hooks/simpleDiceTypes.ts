// キーはダイスの面数、値は振る個数
export type SimpleDices = Record<string, number>;

export const SIMPLE_DICE_COUNT_RANGE = { min: 1, max: 999 };
export const SIMPLE_DICE_FACES_RANGE = { min: 2, max: 1000 };
