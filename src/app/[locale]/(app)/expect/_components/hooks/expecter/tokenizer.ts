import type { Token } from './type';

const tokenRegexp = /^\d+d\d*|[()*+\-/]|\d+/i;

export class TokenizerError extends Error {}

export const tokenize = (command: string): Token[] => {
  const tokens: Token[] = [];
  let match: RegExpMatchArray | null;
  let processingCommand = command;
  // biome-ignore lint/suspicious/noAssignInExpressions: hack
  while ((match = processingCommand.match(tokenRegexp))) {
    if (match.index !== 0) {
      throw new TokenizerError(`Unexpected token: ${processingCommand}`);
    }

    const token = match[0] as Token;
    tokens.push(token);

    processingCommand = processingCommand.slice(token.length);
  }
  if (processingCommand !== '') {
    throw new TokenizerError(`Unexpected token: ${processingCommand}`);
  }

  return tokens;
};
