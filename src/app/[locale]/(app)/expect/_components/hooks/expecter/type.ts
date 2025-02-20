export type DiceAST = Expression | ComparingExpression;

export type ComparingExpression = {
  type: 'comparing';
  expression: Expression;
  target: number;
  sign: InequalitySign;
};

export type Expression = DiceExpression | NumberExpression | OperationExpression;

export type DiceExpression = {
  type: 'dice';
  num: number;
  faces: number;
};

export type NumberExpression = {
  type: 'number';
  value: number;
};

export type OperationExpression = {
  type: 'operation';
  operator: Operator;
  left: Expression;
  right: Expression;
};

export type ResolvedExpression = {
  type: 'resolved';
  result: RawExpectResult;
};

export type Operator = '+' | '-' | '*' | '/';

export type Parenthesis = '(' | ')';

export type InequalitySign = '>=' | '<=';

export type DiceStr = `${number}d${number}` | `${number}D${number}` | `${number}d` | `${number}D`;

export type Token = Parenthesis | Operator | DiceStr;

export type RawExpectResult = Omit<ExpectResult, 'CI' | 'SD' | 'chance' | 'distribution' | 'withTarget'>;

export type ExpectResult = ExpectResultWithTarget | ExpectResultWithoutTarget;

export type ExpectResultWithoutTarget = {
  withTarget: false;
  // 期待値 (expected value)
  mean: number;
  // 標準偏差 (standard deviation)
  SD: number;
  // 分散 (variance)
  variance: number;
  // 範囲 (range)
  range: {
    min: number;
    max: number;
  };
  // 信頼区間 (confidence interval)
  CI: {
    min: number;
    max: number;
  };
  // 分布 (distribution)
  distribution: Record<string, number>;
};

export type ExpectResultWithTarget = {
  withTarget: true;
  target: {
    sign: InequalitySign;
    // 目標の数字
    value: number;
  };
  // 確率 (possibility)
  chance: number;
} & Omit<ExpectResultWithoutTarget, 'withTarget'>;
