import type { DiceAST, ExpectResult } from '../type';
import { calculateDistribution } from './calculateDistribution';
import { resolveExpression } from './resolveExpression';

export const analyzeDiceExpression = (ast: DiceAST): ExpectResult => {
  const withTarget = ast.type === 'comparing';

  const expression = withTarget ? ast.expression : ast;

  const { result } = resolveExpression(expression);

  const { mean, variance, range } = result;
  const SD = Math.sqrt(variance);

  const distribution = calculateDistribution(expression);
  const possibleValues = Object.keys(distribution).map(Number);

  const step = Math.max(
    0.1 / Math.max(mean - range.min, range.max - mean),
    1e-5,
  );

  const CI = (() => {
    for (let d = 1; d >= 0; d -= step) {
      const chance = possibleValues
        // 範囲外のもののみを抽出
        .filter(
          (value) =>
            value < mean - (mean - range.min) * d ||
            value > mean + (range.max - mean) * d,
        )
        .reduce((acc, cur) => acc + distribution[cur], 0);

      if (chance >= 0.05) {
        return {
          max: mean + (range.max - mean) * d,
          min: mean - (mean - range.min) * d,
        };
      }
    }
    return range;
  })();

  if (!withTarget) {
    return {
      withTarget: false,
      mean,
      variance,
      range,
      SD,
      CI,
      distribution,
    };
  }

  const { sign, target } = ast;

  const chance = possibleValues
    .filter((value) => (sign === '>=' ? value >= target : value <= target))
    .reduce((acc, cur) => acc + distribution[cur], 0);

  return {
    withTarget: true,
    mean,
    variance,
    range,
    SD,
    CI,
    distribution,
    chance,
    target: {
      sign,
      value: target,
    },
  };
};
