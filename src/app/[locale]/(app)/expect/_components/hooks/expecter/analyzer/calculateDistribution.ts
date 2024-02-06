import type { DiceExpression, Expression, OperationExpression } from '../type';
import { applyOperatorMap, generate2DArray } from './utils';

export const calculateDistribution = (
  expression: Expression,
): Record<string, number> => {
  if (expression.type === 'operation') {
    return calculateOperationDistribution(expression);
  }

  if (expression.type === 'dice') {
    return calculateDiceDistribution(expression);
  }

  if (expression.type === 'number') {
    return { [expression.value]: 1 };
  }

  const _: never = expression;
  throw new Error('unknown AST type');
};

const calculateOperationDistribution = (
  expression: OperationExpression,
): Record<string, number> => {
  const leftDistribution = calculateDistribution(expression.left);
  const rightDistribution = calculateDistribution(expression.right);

  const distribution: Record<string, number> = {};

  const applyOperator = applyOperatorMap[expression.operator];

  const leftValues = Object.keys(leftDistribution);
  const rightValues = Object.keys(rightDistribution);

  for (let i = 0; i < leftValues.length; i++) {
    for (let j = 0; j < rightValues.length; j++) {
      const valL = leftValues[i];
      const valR = rightValues[j];

      const value = applyOperator(Number(valL), Number(valR));
      const chance =
        Number(leftDistribution[valL]) * Number(rightDistribution[valR]);

      distribution[`${value}`] = (distribution[`${value}`] ?? 0) + chance;
    }
  }

  return distribution;
};

const calculateDiceDistribution = (
  expression: DiceExpression,
): Record<string, number> => {
  const { num, faces } = expression;

  // O(num^2 * faces)

  const dp = generate2DArray(num, faces * num, 0.0);
  for (let i = 0; i < faces; i++) {
    dp[0][i] = 1.0 / faces;
  }
  for (let i = 1; i < num; i++) {
    let sum = 0.0;
    for (let j = 0; j < num * faces; j++) {
      if (j < faces) {
        sum += dp[i - 1][j];
      } else {
        sum = sum - dp[i - 1][j - faces] + dp[i - 1][j];
      }
      dp[i][j] += sum / faces;
    }
  }

  return new Array(num * faces - num + 1)
    .fill(0)
    .map((_, i) => ({ [i + num]: dp[num - 1][i] }))
    .reduce((acc, cur) => ({ ...acc, ...cur }), {});
};
