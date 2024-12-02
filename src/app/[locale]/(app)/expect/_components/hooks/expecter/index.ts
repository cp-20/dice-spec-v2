import { analyzeDiceExpression } from './analyzer';
import { ResolverError } from './analyzer/resolveExpression';
import { formatInput } from './analyzer/utils';
import { ParserError, parseDiceCommand } from './parser';
import { TokenizerError } from './tokenizer';
import type { ExpectResult } from './type';

export type SuccessExpectResult = {
  success: true;
} & ExpectResult;

export type FailedExpectResult = {
  success: false;
  message?: string;
};

export type DiceExpecterResult = SuccessExpectResult | FailedExpectResult;

export const diceExpecter = (input: string): DiceExpecterResult => {
  try {
    const formattedInput = formatInput(input);
    const ast = parseDiceCommand(formattedInput);

    const result = analyzeDiceExpression(ast);
    return { success: true, ...result };
  } catch (err) {
    if (err instanceof ParserError || err instanceof ResolverError || err instanceof TokenizerError) {
      return {
        success: false,
        message: err.message,
      };
    }

    return {
      success: false,
      message: 'unknown error',
    };
  }
};
