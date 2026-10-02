import { calculateCthulhu7thOpposedRoll, calculateCthulhu7thRoll } from './system-specific';

const enumerateRolls = (bonusPenaltyDice: number): number[] => {
  const counts = Array<number>(101).fill(0);
  const diceCount = Math.abs(bonusPenaltyDice) + 1;
  const combinations = 10 ** diceCount;
  for (let combination = 0; combination < combinations; combination++) {
    const tens = Array.from({ length: diceCount }, (_, i) => Math.floor(combination / 10 ** i) % 10);
    const selected = bonusPenaltyDice >= 0 ? Math.min(...tens) : Math.max(...tens);
    for (let ones = 0; ones < 10; ones++) {
      const roll = selected * 10 + ones || 100;
      counts[roll]++;
    }
  }
  return counts.map((count) => count / (combinations * 10));
};

const levelOf = (roll: number, target: number) => {
  if (roll === 1) return 4;
  if (roll * 5 <= target) return 3;
  if (roll * 2 <= target) return 2;
  if (roll <= target) return 1;
  return 0;
};

const modifiers = [-2, -1, 0, 1, 2];
const rolls = new Map(modifiers.map((modifier) => [modifier, enumerateRolls(modifier)]));

test('全技能値・補正の成功度と平均値が出目の列挙と一致する', () => {
  for (const modifier of modifiers) {
    const distribution = rolls.get(modifier)!;
    for (let target = 1; target <= 100; target++) {
      const probabilities = Array<number>(5).fill(0);
      let mean = 0;
      for (let roll = 1; roll <= 100; roll++) {
        probabilities[levelOf(roll, target)] += distribution[roll];
        mean += roll * distribution[roll];
      }
      const result = calculateCthulhu7thRoll(target, modifier);
      for (let level = 0; level < 5; level++) {
        expect(result.rows[level].probability).toBeCloseTo(probabilities[level], 12);
      }
      expect(result.mean).toBeCloseTo(mean, 12);
      expect(result.chance).toBeCloseTo(1 - probabilities[0], 12);
      expect(result.range).toEqual({ min: 1, max: 100 });
    }
  }
});

test('対抗ロールの勝敗と引き分けが全出目の比較と一致する', () => {
  for (const [activeTarget, passiveTarget] of [
    [1, 1],
    [5, 10],
    [49, 50],
    [60, 50],
    [50, 60],
    [100, 100],
    [99, 100],
  ]) {
    for (const activeModifier of modifiers) {
      for (const passiveModifier of modifiers) {
        const active = rolls.get(activeModifier)!;
        const passive = rolls.get(passiveModifier)!;
        const probabilities = [0, 0, 0];
        for (let activeRoll = 1; activeRoll <= 100; activeRoll++) {
          for (let passiveRoll = 1; passiveRoll <= 100; passiveRoll++) {
            const activeLevel = levelOf(activeRoll, activeTarget);
            const passiveLevel = levelOf(passiveRoll, passiveTarget);
            let outcome = Math.sign(passiveLevel - activeLevel);
            if (outcome === 0 && activeLevel > 0) outcome = Math.sign(passiveTarget - activeTarget);
            probabilities[outcome + 1] += active[activeRoll] * passive[passiveRoll];
          }
        }
        const result = calculateCthulhu7thOpposedRoll(activeTarget, passiveTarget, activeModifier, passiveModifier);
        for (let outcome = 0; outcome < 3; outcome++) {
          expect(result.rows[outcome].probability).toBeCloseTo(probabilities[outcome], 12);
        }
        expect(result.chance).toBeCloseTo(probabilities[0], 12);
        expect(result.rows.reduce((sum, row) => sum + row.probability, 0)).toBeCloseTo(1, 12);
      }
    }
  }
});

test.each([-3, 3, 0.5])('非対応の補正 %s を拒否する', (modifier) => {
  expect(() => calculateCthulhu7thRoll(60, modifier)).toThrow(RangeError);
  expect(() => calculateCthulhu7thOpposedRoll(60, 50, modifier, 0)).toThrow(RangeError);
  expect(() => calculateCthulhu7thOpposedRoll(60, 50, 0, modifier)).toThrow(RangeError);
});
