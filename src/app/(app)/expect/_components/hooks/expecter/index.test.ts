import { diceExpecter } from '.';

const singleD6Variance = 35 / 12;
const singleD6Mean = 3.5;

describe('diceExpecter', () => {
  test('1d6', () => {
    expect(diceExpecter('1d6')).toEqual({
      success: true,
      withTarget: false,
      mean: singleD6Mean,
      variance: expect.closeTo(singleD6Variance, 1),
      SD: expect.closeTo(Math.sqrt(singleD6Variance), 1),
      range: {
        min: 1,
        max: 6,
      },
      CI: {
        min: expect.closeTo(1.1, 1),
        max: expect.closeTo(5.9, 1),
      },
      distribution: {
        1: expect.closeTo(1 / 6, 3),
        2: expect.closeTo(1 / 6, 3),
        3: expect.closeTo(1 / 6, 3),
        4: expect.closeTo(1 / 6, 3),
        5: expect.closeTo(1 / 6, 3),
        6: expect.closeTo(1 / 6, 3),
      },
    });
  });
  test('1d6 + 1d6 + 3', () => {
    expect(diceExpecter('1d6 + 1d6 - 3')).toEqual({
      success: true,
      withTarget: false,
      mean: 4,
      variance: expect.closeTo(singleD6Variance * 2, 1),
      SD: expect.closeTo(Math.sqrt(singleD6Variance * 2), 1),
      range: {
        min: -1,
        max: 9,
      },
      CI: {
        min: expect.closeTo(-0.9, 1),
        max: expect.closeTo(8.9, 1),
      },
      distribution: {
        [-1]: expect.closeTo(1 / 36, 3),
        0: expect.closeTo(2 / 36, 3),
        1: expect.closeTo(3 / 36, 3),
        2: expect.closeTo(4 / 36, 3),
        3: expect.closeTo(5 / 36, 3),
        4: expect.closeTo(6 / 36, 3),
        5: expect.closeTo(5 / 36, 3),
        6: expect.closeTo(4 / 36, 3),
        7: expect.closeTo(3 / 36, 3),
        8: expect.closeTo(2 / 36, 3),
        9: expect.closeTo(1 / 36, 3),
      },
    });
  });
  test('1d6 * 1d6 * 2 + 5', () => {
    expect(diceExpecter('1d6 * 1d6 * 2 + 5')).toEqual({
      success: true,
      withTarget: false,
      mean: singleD6Mean ** 2 * 2 + 5,
      variance: expect.closeTo(
        (((singleD6Mean ** 2 * 2 + singleD6Variance) * 35) / 12) * 4,
        1,
      ),
      SD: expect.closeTo(
        Math.sqrt((((singleD6Mean ** 2 * 2 + singleD6Variance) * 35) / 12) * 4),
        1,
      ),
      range: {
        min: 7,
        max: 77,
      },
      CI: {
        min: expect.closeTo(7, 1),
        max: expect.closeTo(76.9, 1),
      },
      distribution: {
        7: expect.closeTo(1 / 36, 3),
        9: expect.closeTo(2 / 36, 3),
        11: expect.closeTo(2 / 36, 3),
        13: expect.closeTo(3 / 36, 3),
        15: expect.closeTo(2 / 36, 3),
        17: expect.closeTo(4 / 36, 3),
        21: expect.closeTo(2 / 36, 3),
        23: expect.closeTo(1 / 36, 3),
        25: expect.closeTo(2 / 36, 3),
        29: expect.closeTo(4 / 36, 3),
        35: expect.closeTo(2 / 36, 3),
        37: expect.closeTo(1 / 36, 3),
        41: expect.closeTo(2 / 36, 3),
        45: expect.closeTo(2 / 36, 3),
        53: expect.closeTo(2 / 36, 3),
        55: expect.closeTo(1 / 36, 3),
        65: expect.closeTo(2 / 36, 3),
        77: expect.closeTo(1 / 36, 3),
      },
    });
  });
  test('3d6 + 1d100 + 1', () => {
    expect(diceExpecter('3d6 + 1d100 + 1')).toEqual({
      success: true,
      withTarget: false,
      mean: singleD6Mean * 3 + 50.5 + 1,
      variance: expect.closeTo(singleD6Variance * 3 + (100 ** 2 - 1) / 12, 1),
      SD: expect.closeTo(
        Math.sqrt(singleD6Variance * 3 + (100 ** 2 - 1) / 12),
        1,
      ),
      range: {
        min: 5,
        max: 119,
      },
      CI: {
        min: expect.closeTo(14, 1),
        max: expect.closeTo(110, 1),
      },
      distribution: expect.anything(),
    });
  });
  test('6 - 1d6', () => {
    expect(diceExpecter('6-1d6')).toEqual({
      success: true,
      withTarget: false,
      mean: 6 - singleD6Mean,
      variance: expect.closeTo(singleD6Variance, 1),
      SD: expect.closeTo(Math.sqrt(singleD6Variance), 1),
      range: {
        min: 0,
        max: 5,
      },
      CI: {
        min: expect.closeTo(0.1, 1),
        max: expect.closeTo(4.9, 1),
      },
      distribution: {
        0: expect.closeTo(1 / 6, 3),
        1: expect.closeTo(1 / 6, 3),
        2: expect.closeTo(1 / 6, 3),
        3: expect.closeTo(1 / 6, 3),
        4: expect.closeTo(1 / 6, 3),
        5: expect.closeTo(1 / 6, 3),
      },
    });
  });
  test('3 + 5d >= 15', () => {
    expect(diceExpecter('3 + 5d >= 15')).toEqual({
      success: true,
      withTarget: true,
      mean: 3 + singleD6Mean * 5,
      variance: expect.closeTo(singleD6Variance * 5, 1),
      SD: expect.closeTo(Math.sqrt(singleD6Variance * 5), 1),
      range: {
        min: 8,
        max: 33,
      },
      CI: {
        min: expect.closeTo(13, 1),
        max: expect.closeTo(28, 1),
      },
      chance: expect.closeTo(0.941, 3),
      distribution: expect.anything(),
      target: {
        sign: '>=',
        value: 15,
      },
    });
  });
  test('3 + 5d <= 14', () => {
    expect(diceExpecter('3 + 5d <= 14')).toEqual({
      success: true,
      withTarget: true,
      mean: 3 + singleD6Mean * 5,
      variance: expect.closeTo(singleD6Variance * 5, 1),
      SD: expect.closeTo(Math.sqrt(singleD6Variance * 5), 1),
      range: {
        min: 8,
        max: 33,
      },
      CI: {
        min: expect.closeTo(13, 1),
        max: expect.closeTo(28, 1),
      },
      chance: expect.closeTo(1 - 0.941, 3),
      distribution: expect.anything(),
      target: {
        sign: '<=',
        value: 14,
      },
    });
  });
  test('1d6 >= 8', () => {
    expect(diceExpecter('1d6 >= 8')).toEqual({
      success: true,
      withTarget: true,
      mean: singleD6Mean,
      variance: expect.closeTo(singleD6Variance, 1),
      SD: expect.closeTo(Math.sqrt(singleD6Variance), 1),
      range: {
        min: 1,
        max: 6,
      },
      CI: {
        min: expect.closeTo(1.1, 1),
        max: expect.closeTo(5.9, 1),
      },
      chance: expect.closeTo(0, 3),
      distribution: {
        1: expect.closeTo(1 / 6, 3),
        2: expect.closeTo(1 / 6, 3),
        3: expect.closeTo(1 / 6, 3),
        4: expect.closeTo(1 / 6, 3),
        5: expect.closeTo(1 / 6, 3),
        6: expect.closeTo(1 / 6, 3),
      },
      target: {
        sign: '>=',
        value: 8,
      },
    });
  });

  test('d6 + 8', () => {
    expect(diceExpecter('d6 + 8')).toEqual({
      success: false,
      message: expect.any(String),
    });
  });

  test('(1d6 + 8', () => {
    expect(diceExpecter('(1d6 + 8')).toEqual({
      success: false,
      message: expect.any(String),
    });
  });

  test('1d6 + 8)', () => {
    expect(diceExpecter('1d6 + 8)')).toEqual({
      success: false,
      message: expect.any(String),
    });
  });

  test('1d6 * 8 + ', () => {
    expect(diceExpecter('1d6 * 8 + ')).toEqual({
      success: false,
      message: expect.any(String),
    });
  });

  test('1000d1000', () => {
    expect(diceExpecter('1000d1000')).toEqual({
      success: false,
      message: expect.any(String),
    });
  });
});
