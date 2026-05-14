import type { System } from './';
import { parseHtmlLog } from './htmlParser';
import { parsers } from './messageParser';

const hash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const memorized = new Map<number, System>();

export const detectSystem = (html: string): System => {
  const htmlHash = hash(html);
  if (memorized.has(htmlHash)) {
    return memorized.get(htmlHash) as System;
  }

  const logs = parseHtmlLog(html);
  const messages = logs.map((l) => l.message);
  const maybeDiceLogs = messages.filter((m) => m.includes('＞'));

  const scores = Object.entries(parsers)
    .map(([system, parser]) => ({
      system: system as System,
      score: maybeDiceLogs.filter((m) => !!parser(m)).length,
    }))
    .toSorted((a, b) => b.score - a.score);

  memorized.set(htmlHash, scores[0].system);

  return scores[0].system;
};
