import { message } from 'valibot';
import type { System } from '../';
import { CoC6thParser, CoC6thSystemStats } from './cthulhu6th';
import { CoC7thParser, CoC7thSystemStats } from './cthulhu7th';
import { emokloreParser, emokloreSystemStats } from './emoklore';
import { shinobigamiParser, shinobigamiSystemStats } from './shinobigami';

export type SystemMessageParserResult = {
  // ダイス結果の文字列 (例: 成功)
  evaluation: string;
  // ダイス結果の数値 (例: [38])
  results: number[];
  // 目標値
  target: number;
};

export type SystemMessageParser = (message: string) => SystemMessageParserResult | null;

export type MessageParserResult = SystemMessageParserResult & {
  // ダイス結果のシステムに依存しない評価 (例: 成功)
  evaluationStatus: 'success' | 'failure' | 'other';
};

export type MessageParser = (message: string) => MessageParserResult | null;

export type SystemStats = {
  // 平均値 (例: 1d100 -> 50.5)
  average: number;
  // 分散 (例: 1d100 -> 833.25)
  variance: number;
  // 低い方/高い方のどっちが良いか
  better: 'low' | 'high';
  // ピボット値 (例: 1d100 -> [1, 11, 21, ..., 91, 101])
  // この値を基準にダイス結果をグループ化する
  // a0 <= x < a1, a1 <= x < a2, ... みたいになる
  pivots: number[];
  // 取り得る評価
  evaluations: Array<{ label: string; status: 'success' | 'failure' | 'other' }>;
};

export const systemStats: Record<System, SystemStats> = {
  emoklore: emokloreSystemStats,
  CoC6th: CoC6thSystemStats,
  CoC7th: CoC7thSystemStats,
  shinobigami: shinobigamiSystemStats,
};

export const systems: Record<System, { id: System; name: string }> = {
  emoklore: { id: 'emoklore', name: 'エモクロアTRPG' },
  CoC6th: { id: 'CoC6th', name: 'クトゥルフ神話TRPG' },
  CoC7th: { id: 'CoC7th', name: '新クトゥルフ神話TRPG' },
  shinobigami: { id: 'shinobigami', name: 'シノビガミ' },
};

export const parsers: Record<System, SystemMessageParser> = {
  emoklore: emokloreParser,
  CoC6th: CoC6thParser,
  CoC7th: CoC7thParser,
  shinobigami: shinobigamiParser,
};

export const parseMessage = (system: System, message: string) => postprocess(system, parsers[system](message));

const postprocess = (system: System, result: SystemMessageParserResult | null) => {
  if (result === null) return null;

  const stats = systemStats[system];
  const rawEval = stats.evaluations.find((e) => e.label === result.evaluation);

  if (rawEval === undefined) {
    console.error(`Unknown evaluation label: ${result.evaluation} for system: ${system}`);
    return {
      ...result,
      evaluationStatus: 'other',
    };
  }

  return {
    ...result,
    evaluationStatus: rawEval.status,
  };
};
