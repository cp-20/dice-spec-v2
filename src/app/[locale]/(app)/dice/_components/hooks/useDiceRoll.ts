import { t } from 'i18next';
import { useCallback } from 'react';
import { useToast } from '@/shared/components/ui/use-toast';
import type { DiceRollResult } from '@/shared/lib/bcdice/getDiceRoll';
import { formatDiceCommand } from '@/shared/lib/formatDiceCommand';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';
import { useBcdiceApi } from './useBcdiceApi';
import type { DiceLog } from './useDiceLogs';
import { useDiceLogs } from './useDiceLogs';
import { useDiceRollOption, useDiceRollValidation } from './useDiceRollOption';
import { useDiceSound } from './useDiceSound';
import { useQuickInput } from './useQuickInput';

const useValidateAndRoll = () => {
  const { getDiceRoll } = useBcdiceApi();
  const { validate } = useDiceRollValidation();
  const {
    option: { system },
  } = useDiceRollOption();

  const validateAndRoll = useCallback(
    async (command: string): Promise<DiceRollResult> => {
      if (!validate(command)) {
        return {
          ok: false,
        };
      }

      const result = await getDiceRoll(command, system);
      return result;
    },
    [getDiceRoll, system, validate],
  );

  return { validateAndRoll };
};

const useConvertResultToLog = () => {
  const {
    option: { system },
  } = useDiceRollOption();

  const convertResultToLog = useCallback(
    (result: DiceRollResult) => {
      if (!result.ok) return;

      const randomKey = Date.now().toString(36) + Math.random().toString().slice(2);

      const variant = (() => {
        if (result.critical || result.success) return 'success';
        if (result.failure || result.fumble) return 'failed';
        return 'default';
      })();

      const diceLog: DiceLog = {
        key: randomKey,
        system,
        log: result.text,
        variant,
      };

      return diceLog;
    },
    [system],
  );

  return { convertResultToLog };
};

export const useDiceRollCore = () => {
  const { addItem } = useQuickInput();
  const { validateAndRoll } = useValidateAndRoll();
  const { convertResultToLog } = useConvertResultToLog();
  const { addDiceLog } = useDiceLogs();

  const diceRoll = useCallback(
    async (command: string) => {
      addItem(command);
      const result = await validateAndRoll(command);
      const log = convertResultToLog(result);
      if (log === undefined) return result;
      addDiceLog(log);

      return result;
    },
    [addDiceLog, addItem, convertResultToLog, validateAndRoll],
  );

  return {
    diceRoll,
  };
};

export const useDiceRoll = () => {
  const { toast } = useToast();
  const { play } = useDiceSound();
  const { diceRoll: diceRollCore } = useDiceRollCore();
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
  };
};
