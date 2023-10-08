import { atom, useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import type { DiceExpecterResult } from './expecter';
import { diceExpecter } from './expecter';
import { useDebounce } from '@/shared/lib/useDebounce';

export type DiceExpecterOption = {
  autoRecalculation: boolean;
};

const commandAtom = atom<string>('');
export const resultAtom = atom<DiceExpecterResult | null>(null);
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
  const [_, setResult] = useAtom(resultAtom);

  const recalculate = useCallback(() => {
    if (command === '') {
      return setResult(null);
    }

    setResult(diceExpecter(command));
  }, [command, setResult]);

  return {
    recalculate,
  };
};

const useAutoRecalculation = (enabled: boolean) => {
  const [command] = useAtom(commandAtom);
  const debouncedCommand = useDebounce(command, 500);
  const [_, setResult] = useAtom(resultAtom);

  useEffect(() => {
    if (!enabled) return;

    if (debouncedCommand === '') {
      return setResult(null);
    }

    setResult(diceExpecter(debouncedCommand));
  }, [debouncedCommand, enabled, setResult]);
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

  return {
    result,
  };
};
