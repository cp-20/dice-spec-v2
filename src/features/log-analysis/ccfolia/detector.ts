import type { System } from './';
import { parseHtmlLog } from './htmlParser';
import { parsers } from './messageParser';
import { isSwordWorld25Message } from './messageParser/swordWorld25';

const hash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const memorized = new Map<number, System | null>();

export const detectSystem = (html: string): System | null => {
  const htmlHash = hash(html);
  if (memorized.has(htmlHash)) {
    return memorized.get(htmlHash) ?? null;
  }

  const logs = parseHtmlLog(html);
  const messages = logs.map((l) => l.message);
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

  memorized.set(htmlHash, detectedSystem);

  return detectedSystem;
};
