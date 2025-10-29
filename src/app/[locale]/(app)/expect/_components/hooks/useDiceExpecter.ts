import { atom, useAtom, useSetAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { formatDiceCommand } from '@/shared/lib/formatDiceCommand';
import { useDebounce } from '@/shared/lib/useDebounce';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';
import type { DiceExpecterResult } from './expecter';
import { diceExpecter } from './expecter';

type DiceExpecterOption = {
  autoRecalculation: boolean;
};

const commandAtom = atom<string>('');
const resultAtom = atom<DiceExpecterResult | null>(null);
const optionAtom = atom<DiceExpecterOption>({
  autoRecalculation: true,
});

export const useDiceCommandInput = () => {
  const [command, setCommand] = useAtom(commandAtom);

  return {
    command,
    setCommand,
  };
};

export const useRecalculation = () => {
  const [command] = useAtom(commandAtom);
  const setResult = useSetAtom(resultAtom);
  const { sendEvent } = useGoogleAnalytics();

  const recalculate = useCallback(() => {
    if (command === '') {
      return setResult(null);
    }

    sendEvent('diceExpecter', command);
    setResult(diceExpecter(command));
  }, [command, sendEvent, setResult]);

  return {
    recalculate,
  };
};

const useAutoRecalculation = (enabled: boolean) => {
  const [command] = useAtom(commandAtom);
  const debouncedCommand = useDebounce(command, 500);
  const setResult = useSetAtom(resultAtom);
  const { sendEvent } = useGoogleAnalytics();

  useEffect(() => {
    if (!enabled) return;

    if (debouncedCommand === '') {
      return setResult(null);
    }

    sendEvent('diceExpecter', formatDiceCommand(debouncedCommand));
    setResult(diceExpecter(debouncedCommand));
  }, [debouncedCommand, enabled, sendEvent, setResult]);
};

export const useDiceExpecterOption = () => {
  const [option, setOption] = useAtom(optionAtom);
  useAutoRecalculation(option.autoRecalculation);

  const toggleAutoRecalculation = useCallback(() => {
    setOption((prev) => ({
      ...prev,
      autoRecalculation: !prev.autoRecalculation,
    }));
  }, [setOption]);

  const setAutoRecalculation = useCallback(
    (value: boolean) => {
      setOption((prev) => ({
        ...prev,
        autoRecalculation: value,
      }));
    },
    [setOption],
  );

  return {
    option,
    toggleAutoRecalculation,
    setAutoRecalculation,
  };
};

export const useDiceExpecterResult = () => {
  const [result] = useAtom(resultAtom);

  return { result };
};
