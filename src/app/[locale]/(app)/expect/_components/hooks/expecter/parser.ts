import { tokenize } from './tokenizer';
import type {
  DiceAST,
  DiceExpression,
  DiceStr,
  Expression,
  NumberExpression,
  OperationExpression,
  Operator,
  Parenthesis,
  Token,
} from './type';

const operatorsSet = new Set<Operator>(['+', '-', '*', '/']);
const isOperator = (token: string): token is Operator => operatorsSet.has(token as Operator);

const diceRegexp = /(\d+)(d|bd|pd)(\d*)/i;
const isDiceStr = (token: string): token is DiceStr => diceRegexp.test(token);

const precedenceMap = new Map<Operator, number>([
  ['+', 1],
  ['-', 1],
  ['*', 2],
  ['/', 2],
]);

export class ParserError extends Error {}

const precedence = (operator: string): number => precedenceMap.get(operator as Operator) ?? 0;

const parseDiceExpression = (expressionStr: string): Expression => {
  const tokens = tokenize(expressionStr);

  const stack: Expression[] = [];
  const operators: (Token | Parenthesis)[] = [];

  for (const token of tokens) {
    if (token === '(') {
      operators.push(token);
    } else if (token === ')') {
      if (!operators.length || !operators.includes('(')) {
        throw new ParserError('Invalid expression');
      }
      while (operators.length && operators[operators.length - 1] !== '(') {
        applyOperator();
      }
      operators.pop(); // Remove the "("
    } else if (isOperator(token)) {
      while (operators.length && precedence(operators.slice(-1)[0]) >= precedence(token)) {
        applyOperator();
      }
      operators.push(token);
    } else if (isDiceStr(token)) {
      // biome-ignore lint/style/noNonNullAssertion: already checked with isDiceStr()
      const [_, num, kind, rawFaces] = token.match(diceRegexp)!;
      const expr: DiceExpression = {
        type: 'dice',
        kind: ({ d: 'normal', bd: 'bonus', pd: 'penalty' }[kind.toLowerCase()] ?? 'normal') as DiceExpression['kind'],
        num: Number(num),
        faces: Number(rawFaces) || 6,
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
      throw new ParserError('Invalid expression');
    }

    if (operator === '/' && right.type === 'number' && right.value === 0) {
      throw new ParserError('Division by zero');
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
    throw new ParserError('Invalid expression');
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
