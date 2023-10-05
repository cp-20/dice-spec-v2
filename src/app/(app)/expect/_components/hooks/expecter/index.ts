import { analyzeDiceExpression } from './analyzer';
import { formatInput } from './analyzer/utils';
import { ParserError, parseDiceCommand } from './parser';
import type { ExpectResult } from './type';
import { ResolverError } from '@/app/(app)/expect/_components/hooks/expecter/analyzer/resolveExpression';

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
    if (err instanceof ParserError) {
      return {
        success: false,
        message: err.message,
      };
    }

    if (err instanceof ResolverError) {
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
