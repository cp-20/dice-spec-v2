import type Result from 'bcdice/lib/result';

import { captureClientException } from '../sentryClient';
import { loadGameSystem } from './loader';

export type DiceRollResult =
  | { ok: false }
  | ({ ok: true } & Pick<Result, 'text' | 'secret' | 'success' | 'failure' | 'critical' | 'fumble'>);

export const getDiceRoll = async (command: string, id: string): Promise<DiceRollResult> => {
  try {
    const system = await loadGameSystem(id);
    const result = system.eval(command);
    if (!result) return { ok: false };
    const { text, secret, success, failure, critical, fumble } = result;
    return { ok: true, text, secret, success, failure, critical, fumble };
  } catch (error) {
    captureClientException(error);
    return { ok: false };
  }
};
