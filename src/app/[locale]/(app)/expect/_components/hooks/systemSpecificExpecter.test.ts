import {
  calculateCthulhu6thOpposedRoll,
  calculateCthulhu7thOpposedRoll,
  calculateCthulhu7thRoll,
  calculateDoubleCross3rdExplodingDice,
  calculateEmokloreSuccessDistribution,
} from './systemSpecificExpecter';

const sum = (values: number[]) => values.reduce((acc, value) => acc + value, 0);

describe('systemSpecificExpecter', () => {
  test('クトゥルフ神話TRPGの対抗ロールを抵抗表で計算する', () => {
    expect(calculateCthulhu6thOpposedRoll(10, 10).chance).toBeCloseTo(0.5, 10);
    expect(calculateCthulhu6thOpposedRoll(12, 10).chance).toBeCloseTo(0.6, 10);
    expect(calculateCthulhu6thOpposedRoll(1, 20).chance).toBeCloseTo(0.05, 10);
    expect(calculateCthulhu6thOpposedRoll(20, 1).chance).toBeCloseTo(0.95, 10);
  });

  test('新クトゥルフ神話TRPGのボーナス・ペナルティダイス分布を計算する', () => {
    const normal = calculateCthulhu7thRoll(50, 0);
    const bonus = calculateCthulhu7thRoll(50, 1);
    const penalty = calculateCthulhu7thRoll(50, -1);

    expect(sum(normal.rows.map((row) => row.probability))).toBeCloseTo(1, 8);
    expect(normal.chance).toBeCloseTo(0.5);
    expect(bonus.chance).toBeGreaterThan(normal.chance ?? 0);
    expect(penalty.chance).toBeLessThan(normal.chance ?? 0);
  });

  test('新クトゥルフ神話TRPGの対抗ロールで勝敗と引き分けを計算する', () => {
    const result = calculateCthulhu7thOpposedRoll(60, 50, 0, 0);

    expect(sum(result.rows.map((row) => row.probability))).toBeCloseTo(1, 8);
    expect(result.chance).toBeGreaterThan(0.5);
  });

  test('エモクロアTRPGの成功度分布を計算する', () => {
    const result = calculateEmokloreSuccessDistribution(1, 7);

    expect(sum(result.rows.map((row) => row.probability))).toBeCloseTo(1, 8);
    expect(result.rows.find((row) => row.label === 'ファンブル')?.probability).toBeCloseTo(0.1);
    expect(result.rows.find((row) => row.label === 'ダブル')?.probability).toBeCloseTo(0.1);
    expect(result.rows.find((row) => row.label === 'カタストロフ')?.probability).toBe(0);
    expect(result.chance).toBeCloseTo(0.7);
  });

  test('ダブルクロス3rdのexploding diceを計算する', () => {
    const result = calculateDoubleCross3rdExplodingDice(1, 10, 0);

    expect(sum(result.rows.map((row) => row.probability))).toBeCloseTo(1, 4);
    expect(result.rows.find((row) => row.label === '1')?.probability).toBeCloseTo(0.1);
    expect(result.rows.find((row) => row.label === '9')?.probability).toBeCloseTo(0.1);
    expect(result.rows.find((row) => row.label === '10')).toBeUndefined();
    expect(result.rows.find((row) => row.label === '11')?.probability).toBeCloseTo(0.01);
    expect(result.rows.every((row) => row.probability >= 0.00001)).toBe(true);
    expect(result.rows.find((row) => row.label === '41')?.probability).toBeCloseTo(0.00001);
    expect(result.rows.find((row) => row.label === '51')).toBeUndefined();
  });
});
