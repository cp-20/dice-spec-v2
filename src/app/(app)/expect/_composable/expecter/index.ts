import { analyzeDiceExpression } from './analyzer';
import { formatInput } from './analyzer/utils';
import { parseDiceCommand } from './parser';
import type { ExpectResult } from './type';

export const diceExpecter = (input: string): ExpectResult => {
  const formattedInput = formatInput(input);
  const ast = parseDiceCommand(formattedInput);

  const result = analyzeDiceExpression(ast);
  return result;
};
