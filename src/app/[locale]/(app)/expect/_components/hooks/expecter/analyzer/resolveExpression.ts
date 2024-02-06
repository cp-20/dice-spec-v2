import type {
  DiceExpression,
  Expression,
  NumberExpression,
  OperationExpression,
  ResolvedExpression,
} from '../type';
import { applyOperatorMap } from './utils';

export class ResolverError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export const resolveExpression = (
  expression: Expression,
): ResolvedExpression => {
  if (expression.type === 'operation') {
    return resolveOperationExpression(expression);
  }

  if (expression.type === 'dice') {
    return resolveDiceExpression(expression);
  }

  if (expression.type === 'number') {
    return resolveNumberExpression(expression);
  }

  const _: never = expression;
  throw new Error('unknown DiceAST type');
};

const resolveOperationExpression = (
  expression: OperationExpression,
): ResolvedExpression => {
  const leftExpression = resolveExpression(expression.left);
  const rightExpression = resolveExpression(expression.right);

  const LMean = leftExpression.result.mean;
  const RMean = rightExpression.result.mean;
  const LVariance = leftExpression.result.variance;
  const RVariance = rightExpression.result.variance;
  const LRange = leftExpression.result.range;
  const RRange = rightExpression.result.range;

  const applyOperator = applyOperatorMap[expression.operator];

  const mean = applyOperator(LMean, RMean);

  const variance = (() => {
    if (expression.operator === '+' || expression.operator === '-') {
      // V(X+Y) = V(X) + V(Y)
      // V(X-Y) = V(X) + V(Y)
      return LVariance + RVariance;
    }
    if (expression.operator === '*') {
      // V(X*Y) = V(X) * V(Y) + E(X)^2 * E(Y) + E(Y)^2 * E(X)
      return (
        LVariance * RVariance + LMean ** 2 * RVariance + RMean ** 2 * LVariance
      );
    }

    // 定数での割り算
    if (LVariance * RVariance === 0) {
      return LVariance || RVariance;
    }

    throw new Error('cannot divide by dice roll');
  })();

  const range = (() => {
    const minmax = [
      applyOperator(LRange.min, RRange.min),
      applyOperator(LRange.min, RRange.max),
      applyOperator(LRange.max, RRange.min),
      applyOperator(LRange.max, RRange.max),
    ];
    return {
      min: Math.min(...minmax),
      max: Math.max(...minmax),
    };
  })();

  return {
    type: 'resolved',
    result: {
      mean,
      variance,
      range,
    },
  };
};

const resolveDiceExpression = (
  expression: DiceExpression,
): ResolvedExpression => {
  const { num, faces } = expression;

  if (num <= 0 || faces <= 0) {
    throw new ResolverError('invalid dice roll');
  }

  if (num * num * faces > 1e5) {
    throw new ResolverError('too many dice');
  }

  // ref: https://qiita.com/cp20/items/b475b6f6757be814846f#dice-integer%E3%81%AE%E6%89%B1%E3%81%84
  const mean = (num * (faces + 1)) / 2;
  const variance = (num * (faces ** 2 - 1)) / 12;
  const range = {
    min: num,
    max: num * faces,
  };

  return {
    type: 'resolved',
    result: {
      mean,
      variance,
      range,
    },
  };
};

const resolveNumberExpression = (
  expression: NumberExpression,
): ResolvedExpression => {
  return {
    type: 'resolved',
    result: {
      mean: expression.value,
      variance: 0,
      range: {
        min: expression.value,
        max: expression.value,
      },
    },
  };
};
