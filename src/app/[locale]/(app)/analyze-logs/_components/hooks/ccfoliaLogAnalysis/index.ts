import { parseHtmlLog } from './htmlParser';
import { type MessageParserResult, parseMessage, systemStats } from './messageParser';
import { formatMessage } from './messageFormatter';
import { type DiceResultSummary, summarizeResults } from './summarizer';

export type System = 'emoklore' | 'CoC7th' | 'CoC6th';

type ResultRecord = MessageParserResult & {
  fullStr: string;
};

export type DiceResultForCharacter = {
  id: string;
  name: string;
  results: ResultRecord[];
  summary: DiceResultSummary;
};

export const analyzeCcfoliaLog = (system: System, html: string) => {
  const logs = parseHtmlLog(html);
  const analyzedLogs = logs
    .flatMap(({ message, ...log }) =>
      formatMessage(message).map((m) => {
        const result = parseMessage(system, m);
        if (result === null) return null;
        return { ...log, result: { ...result, fullStr: `${log.tab} ${message}` } };
      }),
    )
    .filter((log) => log !== null);

  const allResults = analyzedLogs.map(({ result }) => result);
  const allCharacterResults: DiceResultForCharacter = {
    id: 'all',
    name: '[ALL]',
    results: allResults,
    summary: summarizeResults(allResults, systemStats[system]),
  };

  const characters = takeUnique(analyzedLogs.map(({ character }) => character));
  const characterResults: DiceResultForCharacter[] = characters.map((character) => {
    const results = analyzedLogs.filter(({ character: c }) => c === character).map(({ result }) => result);
    const summary = summarizeResults(results, systemStats[system]);
    return { id: `character-${character}`, name: character, results, summary };
  });

  return [allCharacterResults, ...characterResults];
};

const takeUnique = <T>(array: T[]) => Array.from(new Set(array));
