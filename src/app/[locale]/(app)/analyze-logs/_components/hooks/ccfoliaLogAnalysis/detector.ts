import { parsers } from './messageParser';
import type { System } from './';
import { parseHtmlLog } from './htmlParser';

const shuffle = <T>(array: T[]): T[] => {
  const shuffled = array.slice(); // 元の配列をコピー
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 0 から i のランダムなインデックス
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // 要素をスワップ
  }
  return shuffled;
};
const takeRandom = <T>(array: T[], sample: number): T[] => shuffle(array).slice(0, sample);

const memorized = new Map<string, System>();

// 与えられたメッセージからシステムを推測する
// 計算量が多いので、システム数が増えてきたら最適化が必要
// (メッセージの数が多い場合は、メッセージの一部をサンプリングして判断するなど)
export const detectSystem = (html: string): System => {
  if (memorized.has(html)) {
    return memorized.get(html) as System;
  }

  const logs = parseHtmlLog(html);
  const messages = logs.map((l) => l.message);
  const sampledMessages = takeRandom(messages, 100);

  const scores = Object.entries(parsers)
    .map(([system, parser]) => ({
      system: system as System,
      score: sampledMessages.filter((m) => !!parser(m)).length,
    }))
    .toSorted((a, b) => b.score - a.score);

  memorized.set(html, scores[0].system);

  return scores[0].system;
};
