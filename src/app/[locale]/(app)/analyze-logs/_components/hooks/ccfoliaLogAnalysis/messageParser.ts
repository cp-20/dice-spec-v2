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

  const diceTarget = parseInt(match[1], 10);
  const diceResultNumber = match[3].includes(',')
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

export type SingleMessageParser = (
  message: string,
) => MatcherResult | undefined;

const parseSingleMessage: SingleMessageParser = (message: string) => {
  for (const matcher of matchers) {
    const result = matcher(message);
    if (result !== undefined) return { message, ...result };
  }
};

const repeatDiceRollPrefixRegex = /^x(\d+)\s/;
const convertRepeatDiceRollMessage = (message: string) => {
  const match = message.match(repeatDiceRollPrefixRegex);
  if (match === null) return [message];

  const repeatCount = parseInt(match[1], 10);
  const normalizedMessage = message.replace(/(x\d+.*)\s#1\n/, '$1\n\n#1\n');

  const diceRollStr = normalizedMessage
    .split('\n')[0]
    .replace(repeatDiceRollPrefixRegex, '');

  return normalizedMessage
    .replace(/\n#(\d+)\n/g, `($1/${repeatCount}) ${diceRollStr} `)
    .split('\n')
    .slice(1);
};

export type MessageParser = (
  message: string,
) => ReturnType<SingleMessageParser>[];

export const parseMessage: MessageParser = (message) => {
  return convertRepeatDiceRollMessage(message).map(parseSingleMessage);
};
