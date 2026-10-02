import type { DiceExpression, Expression, OperationExpression } from '../type';
import { applyOperatorMap } from './utils';

export class DistributionError extends Error {}

export const calculateDistribution = (expression: Expression): Record<string, number> => {
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

const calculateOperationDistribution = (expression: OperationExpression): Record<string, number> => {
  const leftDistribution = calculateDistribution(expression.left);
  const rightDistribution = calculateDistribution(expression.right);

  const distribution: Record<string, number> = {};

  const applyOperator = applyOperatorMap[expression.operator];

  const leftValues = Object.keys(leftDistribution);
  const rightValues = Object.keys(rightDistribution);
  if (leftValues.length * rightValues.length > 1_000_000) {
    throw new DistributionError('distribution is too large');
  }

  for (let i = 0; i < leftValues.length; i++) {
    for (let j = 0; j < rightValues.length; j++) {
      const valL = leftValues[i];
      const valR = rightValues[j];

      const value = applyOperator(Number(valL), Number(valR));
      const chance = Number(leftDistribution[valL]) * Number(rightDistribution[valR]);

      distribution[`${value}`] = (distribution[`${value}`] ?? 0) + chance;
    }
  }

  return distribution;
};

const calculateDiceDistribution = (expression: DiceExpression): Record<string, number> => {
  const { num, kind, faces } = expression;

  // O(num^2 * faces)

  if (kind === 'bonus' || kind === 'penalty') {
    const result: Record<string, number> = {};
    for (let i = 0; i < faces; i++) {
      const key = kind === 'bonus' ? i + 1 : faces - i;
      result[key] = ((i + 1) ** num - i ** num) / faces ** num;
    }
    return result;
  }

  let previous = Array<number>(faces * num).fill(0);
  let current = num === 1 ? [] : Array<number>(faces * num).fill(0);
  for (let i = 0; i < faces; i++) {
    previous[i] = 1.0 / faces;
  }
  for (let i = 1; i < num; i++) {
    let sum = 0.0;
    for (let j = 0; j < num * faces; j++) {
      if (j < faces) {
        sum += previous[j];
      } else {
        sum = sum - previous[j - faces] + previous[j];
      }
      current[j] = sum / faces;
    }
    [previous, current] = [current, previous];
  }

  const result: Record<string, number> = {};
  for (let i = 0; i < num * faces - num + 1; i++) {
    const key = i + num;
    const value = previous[i];
    result[key] = value;
  }
  return result;
};
