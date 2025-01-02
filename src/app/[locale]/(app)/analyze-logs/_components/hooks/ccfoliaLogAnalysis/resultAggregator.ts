import type { DiceResultForCharacter, System } from '.';
import { systemStats } from './messageParser';

export const aggregateResults = (results: DiceResultForCharacter['results'], system: System) => {
  const stats = systemStats[system];
  const labels = stats.pivots.slice(1).map((pivot, i) => `${stats.pivots[i]}-${pivot - 1}`);

  const data = results.reduce((acc, { result }) => {
    const pivot = stats.pivots.findIndex((pivot) => result < pivot) - 1;
    return acc.map((value, i) => (i === pivot ? value + 1 : value));
  }, new Array(labels.length).fill(0));

  return { labels, data };
};
