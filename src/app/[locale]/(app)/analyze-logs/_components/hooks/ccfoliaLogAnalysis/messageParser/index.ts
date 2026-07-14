import type {
  System,
  SystemMessageParser,
  SystemMessageParserResult,
  SystemStats,
} from '@/features/log-analysis/model';

import { CoC6thParser, CoC6thSystemStats } from './cthulhu6th';
import { CoC7thParser, CoC7thSystemStats } from './cthulhu7th';
import { emokloreParser, emokloreSystemStats } from './emoklore';
import { nechronicaParser, nechronicaSystemStats } from './nechronica';
import { shinobigamiParser, shinobigamiSystemStats } from './shinobigami';

export type {
  MessageParserResult,
  SystemMessageParser,
  SystemMessageParserResult,
  SystemStats,
} from '@/features/log-analysis/model';

export const systemStats: Record<System, SystemStats> = {
  emoklore: emokloreSystemStats,
  CoC6th: CoC6thSystemStats,
  CoC7th: CoC7thSystemStats,
  shinobigami: shinobigamiSystemStats,
  nechronica: nechronicaSystemStats,
};

export const systems: Record<System, { id: System; name: string }> = {
  emoklore: { id: 'emoklore', name: 'エモクロアTRPG' },
  CoC6th: { id: 'CoC6th', name: 'クトゥルフ神話TRPG' },
  CoC7th: { id: 'CoC7th', name: '新クトゥルフ神話TRPG' },
  shinobigami: { id: 'shinobigami', name: 'シノビガミ' },
  nechronica: { id: 'nechronica', name: 'ネクロニカ' },
};

export const parsers: Record<System, SystemMessageParser> = {
  emoklore: emokloreParser,
  CoC6th: CoC6thParser,
  CoC7th: CoC7thParser,
  shinobigami: shinobigamiParser,
  nechronica: nechronicaParser,
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
      evaluationStatus: 'other' as const,
    };
  }

  return {
    ...result,
    evaluationStatus: rawEval.status,
  };
};
