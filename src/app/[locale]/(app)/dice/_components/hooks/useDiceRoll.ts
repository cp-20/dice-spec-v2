import { t } from 'i18next';
import { atom, useAtomValue, useStore } from 'jotai';
import { useCallback } from 'react';

import { useToast } from '@/shared/components/ui/use-toast';
import { getDiceRoll, type DiceRollResult } from '@/shared/lib/bcdice/getDiceRoll';
import { formatDiceCommand } from '@/shared/lib/formatDiceCommand';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

import type { DiceLog } from './useDiceLogs';
import { useDiceLogs } from './useDiceLogs';
import { diceRollOptionAtom, useDiceRollOption } from './useDiceRollOption';
import { useDiceSound } from './useDiceSound';
import { useQuickInput } from './useQuickInput';

const rollingAtom = atom(false);

export const useDiceRollCore = () => {
  const store = useStore();
  const rolling = useAtomValue(rollingAtom);
  const option = useAtomValue(diceRollOptionAtom);
  const { addItem } = useQuickInput();
  const { addDiceLog } = useDiceLogs();

  const diceRoll = useCallback(
    async (command: string): Promise<DiceRollResult> => {
      const selected = store.get(diceRollOptionAtom);
      if (store.get(rollingAtom) || !selected.systemInfo?.command_pattern.test(command)) return { ok: false };
      store.set(rollingAtom, true);
      try {
        addItem(command);
        const result = await getDiceRoll(command, selected.system);
        if (store.get(diceRollOptionAtom) !== selected) return { ok: false };
        if (result.ok) {
          const variant =
            result.critical || result.success ? 'success' : result.failure || result.fumble ? 'failed' : 'default';
          const log: DiceLog = {
            key: Date.now().toString(36) + Math.random().toString().slice(2),
            system: selected.system,
            log: result.text,
            variant,
          };
          addDiceLog(log);
        }
        return result;
      } finally {
        store.set(rollingAtom, false);
      }
    },
    [addDiceLog, addItem, store],
  );
  return { diceRoll, disabled: rolling || !option.systemInfo };
};

export const useDiceRoll = () => {
  const { toast } = useToast();
  const { play } = useDiceSound();
  const { diceRoll: diceRollCore, disabled } = useDiceRollCore();
  const {
    option: { system },
  } = useDiceRollOption();
  const { sendEvent } = useGoogleAnalytics();

  const diceRoll = useCallback(
    async (command: string) => {
      sendEvent('diceRoll', [system, formatDiceCommand(command)]);
      const result = await diceRollCore(command);
      play();

      if (!result.ok) {
        sendEvent('diceRollFailed', [system, command]);
        toast({
          title: t('dice:advanced.error'),
          variant: 'destructive',
        });
      }

      return result;
    },
    [diceRollCore, play, sendEvent, system, toast],
  );

  return {
    diceRoll,
    disabled,
  };
};
