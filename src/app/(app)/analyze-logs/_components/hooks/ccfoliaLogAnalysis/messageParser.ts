export type Matcher = (message: string) => MatcherResult | undefined;

export type MatcherResult = {
  diceResult: string;
  diceResultNumber: number | undefined;
  diceTarget: number;
};

const CoC7thDiceRollRegex =
  /\(1D100<=(\d+)\) ボーナス・ペナルティダイス\[(-2|-1|0|1|2)\] ＞ (.+) ＞ (\d+) ＞ (.+)/;
const Coc7thMatcher: Matcher = (message) => {
  const match = message.match(CoC7thDiceRollRegex);
  if (match === null) return;

  const diceTarget = parseInt(match[2], 10);
  const diceResultNumber = match[2].includes(',')
    ? undefined
    : parseInt(match[4], 10);
  const diceResult = match[5];
  return { diceResult, diceResultNumber, diceTarget };
};

const CoC6thBDiceRollRegex = /\(1D100<=(\d+)\) ＞ (\d+) ＞ (.+)/;
const CoC6thMatcher: Matcher = (message) => {
  const match = message.match(CoC6thBDiceRollRegex);
  if (match === null) return;

  const diceTarget = parseInt(match[1], 10);
  const diceResultNumber = parseInt(match[2], 10);
  const diceResult = match[3];
  return { diceResult, diceResultNumber, diceTarget };
};

const matchers: Matcher[] = [Coc7thMatcher, CoC6thMatcher];

export type MessageParser = (
  message: string,
) => (MatcherResult & { message: string }) | undefined;

export const parseMessage: MessageParser = (message) => {
  for (const matcher of matchers) {
    const result = matcher(message);
    if (result) return { message, ...result };
  }
};
