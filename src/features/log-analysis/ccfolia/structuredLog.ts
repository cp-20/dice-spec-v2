export type StructuredLog = {
  color: string | null;
  tab: string;
  character: string;
  message: string;
  channel?: string;
  createdAt?: number;
};

export const logTab = (channel: string, name: string) =>
  `[${['main', 'info', 'other'].includes(channel) ? channel : name || channel}]`;

export const mergeStructuredLogs = (sources: StructuredLog[][]) => {
  const logs: StructuredLog[] = [];
  const seen = new Map<string, number>();
  let duplicateCount = 0;
  for (const source of sources) {
    const occurrences = new Map<string, number>();
    for (const log of source) {
      if (log.createdAt === undefined) {
        logs.push(log);
        continue;
      }
      // 出力にはメッセージIDがないため、日時・タブ・発言者・本文で照合する。
      // 同一ファイル内の同じ発言は回数を維持し、別ファイルに重なる分だけ除く。
      const key = JSON.stringify([log.createdAt, log.channel, log.character, log.message]);
      const count = (occurrences.get(key) ?? 0) + 1;
      occurrences.set(key, count);
      if (count <= (seen.get(key) ?? 0)) duplicateCount++;
      else logs.push(log);
    }
    for (const [key, count] of occurrences) seen.set(key, Math.max(count, seen.get(key) ?? 0));
  }
  return { logs, duplicateCount };
};
