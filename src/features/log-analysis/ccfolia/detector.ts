import type { System } from './';
import { formatMessage } from './messageFormatter';
import { parsers } from './messageParser';
import { isSwordWorld25Message } from './messageParser/swordWorld25';
import type { StructuredLog } from './structuredLog';

export const detectSystem = (logs: StructuredLog[]): System | null => {
  const messages = logs.flatMap((log) => formatMessage(log.message));
  const maybeDiceLogs = messages.filter((m) => m.includes('＞'));

  const scores = Object.entries(parsers)
    .map(([system, parser]) => ({
      system: system as System,
      score: maybeDiceLogs.filter((message) =>
        system === 'SwordWorld2.5' ? isSwordWorld25Message(message) : !!parser(message),
      ).length,
    }))
    .toSorted((a, b) => b.score - a.score);

  const topScore = scores[0];
  const secondScore = scores[1];
  const detectedSystem =
    topScore === undefined || topScore.score === 0 || topScore.score === secondScore?.score ? null : topScore.system;

  return detectedSystem;
};
