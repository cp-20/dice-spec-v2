import { diceExpecter } from '.';

const singleD6Variance = 35 / 12;
const singleD6Mean = 3.5;

describe('diceExpecter', () => {
  test('3d4 の分布が全出目の列挙と一致する', () => {
    const counts: Record<number, number> = {};
    for (let first = 1; first <= 4; first++) {
      for (let second = 1; second <= 4; second++) {
        for (let third = 1; third <= 4; third++) {
          const total = first + second + third;
          counts[total] = (counts[total] ?? 0) + 1;
        }
      }
    }
    const result = diceExpecter('3d4');
    expect(result.success).toBe(true);
    if (!result.success) throw new Error(result.message);
    expect(Object.keys(result.distribution)).toEqual(Object.keys(counts));
    for (const [value, count] of Object.entries(counts)) {
      expect(result.distribution[value]).toBeCloseTo(count / 64, 14);
    }
  });

  test.each(['100d100', '400d6', '1000d1'])('%s の確率合計と統計値を維持する', (command) => {
    const result = diceExpecter(command);
    expect(result.success).toBe(true);
    if (!result.success) throw new Error(result.message);
    const entries = Object.entries(result.distribution);
    const probability = entries.reduce((sum, [, chance]) => sum + chance, 0);
    const mean = entries.reduce((sum, [value, chance]) => sum + Number(value) * chance, 0);
    expect(probability).toBeCloseTo(1, 8);
    expect(mean).toBeCloseTo(result.mean, 6);
    expect(entries).toHaveLength(result.range.max - result.range.min + 1);
  });

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
        min: 1,
        max: 6,
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
        min: -1,
        max: 9,
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
      variance: expect.closeTo((((singleD6Mean ** 2 * 2 + singleD6Variance) * 35) / 12) * 4, 1),
      SD: expect.closeTo(Math.sqrt((((singleD6Mean ** 2 * 2 + singleD6Variance) * 35) / 12) * 4), 1),
      range: {
        min: 7,
        max: 77,
      },
      CI: {
        min: 7,
        max: 77,
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
      SD: expect.closeTo(Math.sqrt(singleD6Variance * 3 + (100 ** 2 - 1) / 12), 1),
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
        min: 0,
        max: 5,
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
  test('1d6 - 1d6', () => {
    expect(diceExpecter('1d6-1d6')).toEqual({
      success: true,
      withTarget: false,
      mean: 0,
      variance: expect.closeTo(singleD6Variance * 2, 1),
      SD: expect.closeTo(Math.sqrt(singleD6Variance * 2), 1),
      range: {
        min: -5,
        max: 5,
      },
      CI: {
        min: -5,
        max: 5,
      },
      distribution: {
        '-5': expect.closeTo(1 / 36, 3),
        '-4': expect.closeTo(2 / 36, 3),
        '-3': expect.closeTo(3 / 36, 3),
        '-2': expect.closeTo(4 / 36, 3),
        '-1': expect.closeTo(5 / 36, 3),
        '0': expect.closeTo(6 / 36, 3),
        '1': expect.closeTo(5 / 36, 3),
        '2': expect.closeTo(4 / 36, 3),
        '3': expect.closeTo(3 / 36, 3),
        '4': expect.closeTo(2 / 36, 3),
        '5': expect.closeTo(1 / 36, 3),
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
        min: 13,
        max: 28,
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
        min: 13,
        max: 28,
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
        min: 1,
        max: 6,
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

  test('1d6 / 2 の分散を除数の二乗で割る', () => {
    const result = diceExpecter('1d6 / 2');
    expect(result).toMatchObject({
      success: true,
      mean: singleD6Mean / 2,
      variance: expect.closeTo(singleD6Variance / 4, 5),
      range: { min: 0.5, max: 3 },
    });
  });

  test('ゼロまたはランダムな値での除算を拒否する', () => {
    expect(diceExpecter('1 / (1 - 1)')).toMatchObject({ success: false });
    expect(diceExpecter('1 / 1d6')).toMatchObject({ success: false });
  });

  test('巨大な分布の直積を計算前に拒否する', () => {
    expect(diceExpecter('1d1001 * 1d1001')).toMatchObject({ success: false });
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

  test('1d6 * 8 +', () => {
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

  test('2bd6', () => {
    expect(diceExpecter('2bd6')).toEqual({
      success: true,
      withTarget: false,
      mean: expect.closeTo(161 / 36, 1),
      variance: expect.closeTo(791 / 36 - (161 / 36) ** 2, 1),
      SD: expect.closeTo(Math.sqrt(791 / 36 - (161 / 36) ** 2), 1),
      range: {
        min: 1,
        max: 6,
      },
      CI: {
        min: 1,
        max: 6,
      },
      distribution: {
        1: expect.closeTo(1 / 36, 3),
        2: expect.closeTo(3 / 36, 3),
        3: expect.closeTo(5 / 36, 3),
        4: expect.closeTo(7 / 36, 3),
        5: expect.closeTo(9 / 36, 3),
        6: expect.closeTo(11 / 36, 3),
      },
    });
  });

  test('2pd6', () => {
    expect(diceExpecter('2pd6')).toEqual({
      success: true,
      withTarget: false,
      mean: expect.closeTo(91 / 36, 1),
      variance: expect.closeTo(791 / 36 - (161 / 36) ** 2, 1),
      SD: expect.closeTo(Math.sqrt(791 / 36 - (161 / 36) ** 2), 1),
      range: {
        min: 1,
        max: 6,
      },
      CI: {
        min: 1,
        max: 6,
      },
      distribution: {
        1: expect.closeTo(11 / 36, 3),
        2: expect.closeTo(9 / 36, 3),
        3: expect.closeTo(7 / 36, 3),
        4: expect.closeTo(5 / 36, 3),
        5: expect.closeTo(3 / 36, 3),
        6: expect.closeTo(1 / 36, 3),
      },
    });
  });
});

test.each([
  ['(1d6 / 2) + (1d6 / 2)', (left: number, right: number) => left / 2 + right / 2],
  ['(1 - 1d6) - (1d6 / 2)', (left: number, right: number) => 1 - left - right / 2],
  ['(1 - 1d6) * (1d6 / 2)', (left: number, right: number) => (1 - left) * (right / 2)],
])('%s の分布が全出目の列挙と一致する', (command, calculate) => {
  const counts: Record<number, number> = {};
  for (let left = 1; left <= 6; left++) {
    for (let right = 1; right <= 6; right++) {
      const value = calculate(left, right);
      counts[value] = (counts[value] ?? 0) + 1;
    }
  }
  const result = diceExpecter(command);
  expect(result.success).toBe(true);
  if (!result.success) throw new Error(result.message);
  expect(Object.keys(result.distribution).sort()).toEqual(Object.keys(counts).sort());
  for (const [value, count] of Object.entries(counts)) {
    expect(result.distribution[value]).toBeCloseTo(count / 36, 14);
  }
});
