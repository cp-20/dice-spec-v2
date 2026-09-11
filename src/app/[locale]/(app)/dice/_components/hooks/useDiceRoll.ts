import type Result from 'bcdice/lib/result';
import { t } from 'i18next';
import { useAtomValue, useStore } from 'jotai';
import { useCallback } from 'react';

import { useToast } from '@/shared/components/ui/use-toast';
import { formatDiceCommand } from '@/shared/lib/formatDiceCommand';
import { captureClientException } from '@/shared/lib/sentryClient';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

import type { DiceLog } from './useDiceLogs';
import { useDiceLogs } from './useDiceLogs';
import { useDiceSound } from './useDiceSound';
import { gameSystemAtom } from './useGameSystem';
import { useQuickInput } from './useQuickInput';

export const useDiceRollCore = () => {
  const store = useStore();
  const selection = useAtomValue(gameSystemAtom);
  const { addItem } = useQuickInput();
  const { addDiceLog } = useDiceLogs();

  const diceRoll = useCallback(
    (command: string): Result | null => {
      const selected = store.get(gameSystemAtom);
      if (!selected.engine?.COMMAND_PATTERN.test(command)) return null;
      try {
        addItem(command);
        const result = selected.engine.eval(command);
        if (result) {
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
      } catch (error) {
        captureClientException(error);
        return null;
      }
    },
    [addDiceLog, addItem, store],
  );
  return { diceRoll, disabled: selection.status !== 'ready' };
};

export const useDiceRoll = () => {
  const { toast } = useToast();
  const { play } = useDiceSound();
  const { diceRoll: diceRollCore, disabled } = useDiceRollCore();
  const store = useStore();
  const { sendEvent } = useGoogleAnalytics();

  const diceRoll = useCallback(
    (command: string) => {
      const { system } = store.get(gameSystemAtom);
      sendEvent('diceRoll', [system, formatDiceCommand(command)]);
      const result = diceRollCore(command);
      play();

      if (!result) {
        sendEvent('diceRollFailed', [system, command]);
        toast({
          title: t('dice:advanced.error'),
          variant: 'destructive',
        });
      }

      return result;
    },
    [diceRollCore, play, sendEvent, store, toast],
  );

  return {
    diceRoll,
    disabled,
  };
};
