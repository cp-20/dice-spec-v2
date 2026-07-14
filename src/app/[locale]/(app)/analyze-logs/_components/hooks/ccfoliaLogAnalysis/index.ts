import type { DiceResultForCharacter, System } from '@/features/log-analysis/model';

import { ALL_CHARACTER_ID, ALL_CHARACTER_NAME } from '../../constants';
import { parseHtmlLog } from './htmlParser';
import { formatMessage } from './messageFormatter';
import { parseMessage, systemStats } from './messageParser';
import { summarizeResults } from './summarizer';
import { formatLogTabName } from './tabName';

export type { DiceResultForCharacter, System } from '@/features/log-analysis/model';

export const analyzeCcfoliaLog = (system: System, html: string, tabs?: string[]) => {
  const logs = parseHtmlLog(html).filter((log) => tabs === undefined || tabs.includes(log.tab));
  if (logs.length === 0) {
    throw new Error('No logs detected');
  }

  const analyzedLogs = logs
    .flatMap(({ message, ...log }) =>
      formatMessage(message).map((m) => {
        const result = parseMessage(system, m);
        if (result === null) return null;
        return { ...log, result: { ...result, fullStr: `${formatLogTabName(log.tab)} ${message}` } };
      }),
    )
    .filter((log) => log !== null);

  if (analyzedLogs.length === 0) {
    throw new Error('No valid dice rolls found');
  }

  const allResults = analyzedLogs.map(({ result }) => result);
  const allCharacterResults: DiceResultForCharacter = {
    id: ALL_CHARACTER_ID,
    name: ALL_CHARACTER_NAME,
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
