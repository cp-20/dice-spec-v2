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

  const CI = (() => {
    let left = range.min;
    let right = range.max;
    let leftProb = 0;
    let rightProb = 0;

    // 累積確率を計算
    const sortedValues = possibleValues.slice().sort((a, b) => a - b);

    // 左側から2.5%を足す
    for (let i = 0; i < sortedValues.length; i++) {
      leftProb += distribution[sortedValues[i]];
      if (leftProb >= 0.025) {
        left = sortedValues[i];
        break;
      }
    }

    // 右側から2.5%を足す
    for (let i = sortedValues.length - 1; i >= 0; i--) {
      rightProb += distribution[sortedValues[i]];
      if (rightProb >= 0.025) {
        right = sortedValues[i];
        break;
      }
    }

    return { min: left, max: right };
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
