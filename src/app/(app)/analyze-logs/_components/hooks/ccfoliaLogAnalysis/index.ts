import type { DiceResultSummary } from './calculateDiceResultSummary';
import { calculateDiceResultSummary } from './calculateDiceResultSummary';
import type { DiceResult } from './diceResultAnalyzer';
import { analyzeDiceResult } from './diceResultAnalyzer';
import { parseMessage } from './messageParser';

export type ParsedLog = {
  tab: string;
  character: string;
  result: {
    message: string;
    diceResultNumber: number | undefined;
    diceResult: string;
    diceTarget: number;
  };
};

export type CharacterResult = {
  id: string;
  name: string;
  diceResults: DiceResult[];
  diceResultSummary: DiceResultSummary;
};

export const analyzeCcfoliaLog = (html: string) => {
  const parser = new DOMParser();

  const doc = parser.parseFromString(html, 'text/html');
  const logElements = Array.from(doc.querySelectorAll('body > p'));

  const extractedLogs = logElements.map(extractLogFromElement);
  const parsedLogs = extractedLogs
    .flatMap(({ message, ...log }) =>
      parseMessage(message).map((result) => ({
        ...log,
        result,
      })),
    )
    .filter(({ result }) => result !== undefined) as ParsedLog[];

  const analyzedLogs = parsedLogs.map((log) => ({
    ...log,
    result: analyzeDiceResult(log),
  }));

  const allDiceResults = analyzedLogs.map(({ result }) => result);

  const allCharactersDiceResults: CharacterResult = {
    id: 'all',
    name: '[ALL]',
    diceResults: allDiceResults,
    diceResultSummary: calculateDiceResultSummary(allDiceResults),
  };

  const characters = takeUnique(analyzedLogs.map(({ character }) => character));

  const characterResults: CharacterResult[] = characters.map((character) => {
    const diceResults = analyzedLogs
      .filter(({ character: c }) => c === character)
      .map(({ result }) => result);

    const diceResultSummary = calculateDiceResultSummary(diceResults);

    return {
      id: `character-${character}`,
      name: character,
      diceResults,
      diceResultSummary,
    };
  });

  return [allCharactersDiceResults, ...characterResults];
};

const takeUnique = <T>(array: T[]) => Array.from(new Set(array));

const extractLogFromElement = (element: Element) => {
  const spanElements = Array.from(element.getElementsByTagName('span'));
  const textContents = spanElements.map((element) => element.innerText);

  const [tab, character, message] = textContents;

  return { tab, character, message: message.trim() };
};
