import type {
  Operator,
  DiceStr,
  DiceAST,
  Token,
  Parenthesis,
  DiceExpression,
  NumberExpression,
  OperationExpression,
  Expression,
} from './type';

const tokenRegexp = /(\d+d\d*)|([()*+\-/])|(\d+)/gi;

const operatorsSet = new Set<Operator>(['+', '-', '*', '/']);
const isOperator = (token: string): token is Operator =>
  operatorsSet.has(token as Operator);

const diceRegexp = /(\d+)d(\d*)/i;
const isDiceStr = (token: string): token is DiceStr => diceRegexp.test(token);

const precedenceMap = new Map<Operator, number>([
  ['+', 1],
  ['-', 1],
  ['*', 2],
  ['/', 2],
]);

const precedence = (operator: string): number =>
  precedenceMap.get(operator as Operator) ?? 0;

const parseDiceExpression = (expressionStr: string): Expression => {
  const tokens = expressionStr.match(tokenRegexp);
  if (tokens === null) {
    throw new Error('Invalid expression');
  }

  const stack: Expression[] = [];
  const operators: (Token | Parenthesis)[] = [];

  for (const token of tokens) {
    if (token === '(') {
      operators.push(token);
    } else if (token === ')') {
      if (!operators.length || !operators.includes('(')) {
        throw new Error('Invalid expression');
      }
      while (operators.length && operators[operators.length - 1] !== '(') {
        applyOperator();
      }
      operators.pop(); // Remove the "("
    } else if (isOperator(token)) {
      while (
        operators.length &&
        precedence(operators.slice(-1)[0]) >= precedence(token)
      ) {
        applyOperator();
      }
      operators.push(token);
    } else if (isDiceStr(token)) {
      const [num, rawFaces] = token.split(/d/i).map(Number);
      const faces = rawFaces || 6;
      const expr: DiceExpression = {
        type: 'dice',
        num,
        faces,
      };
      stack.push(expr);
    } else {
      const expr: NumberExpression = {
        type: 'number',
        value: Number(token),
      };
      stack.push(expr);
    }
  }

  while (operators.length) {
    applyOperator();
  }

  function applyOperator() {
    const operator = operators.pop();
    const right = stack.pop();
    const left = stack.pop();

    if (!operator || !left || !right) return;

    if (!isOperator(operator)) {
      throw new Error('Invalid expression');
    }

    if (operator === '/' && right.type === 'number' && right.value === 0) {
      throw new Error('Division by zero');
    }

    const expr: OperationExpression = {
      type: 'operation',
      operator,
      left,
      right,
    };

    stack.push(expr);
  }

  if (operators.length > 0 || stack.length !== 1) {
    throw new Error('Invalid expression');
  }

  return stack[0];
};

const inequalitySignRegexp = />=|<=/;

export const parseDiceCommand = (command: string): DiceAST => {
  const trimmedCommand = command.replace(/\s/g, '');

  if (trimmedCommand.search(inequalitySignRegexp) === -1) {
    return parseDiceExpression(trimmedCommand);
  }

  const [expressionStr, targetStr] = trimmedCommand.split(inequalitySignRegexp);
  const expression = parseDiceExpression(expressionStr);
  const target = Number(targetStr);

  return {
    type: 'comparing',
    expression,
    target,
    sign: trimmedCommand.includes('>=') ? '>=' : '<=',
  };
};
