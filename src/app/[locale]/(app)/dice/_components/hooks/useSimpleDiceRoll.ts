import { useCallback } from 'react';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';
import type { AvailableDice, SimpleDices } from './useSimpleDiceInput';
import { useSimpleDiceOutput } from './useSimpleDiceOutput';

const useSimpleDiceRollCore = () => {
  const simpleDiceRoll = useCallback((dices: Partial<SimpleDices>) => {
    const validDices = Object.entries(dices).filter(([, count]) => count > 0);
    if (validDices.length === 0) return null;

    const inputStr = validDices.map(([dice, count]) => `${count}D${dice}`).join(' + ');

    const result = validDices.map(([dice, count]) => ({
      dice: dice as AvailableDice,
      result: [...Array(count)].map(() => Math.floor(Math.random() * Number(dice)) + 1),
    }));

    const allSum = sum(result.map(({ result }) => sum(result)));

    const resultStr = [
      inputStr,
      result.map(({ result }) => `${sum(result)}[${result.join(', ')}]`).join(' + '),
      allSum,
    ].join(' => ');

    return { result, sum: allSum, resultStr };
  }, []);

  return { simpleDiceRoll };
};

const sum = (arr: number[]) => arr.reduce((acc, curr) => acc + curr, 0);

export const useSimpleDiceRoll = () => {
  const { simpleDiceRoll: simpleDiceRollCore } = useSimpleDiceRollCore();
  const { setOutput } = useSimpleDiceOutput();
  const { sendEvent } = useGoogleAnalytics();

  const simpleDiceRoll = useCallback(
    (dices: Partial<SimpleDices>) => {
      const result = simpleDiceRollCore(dices);
      if (result === null) return;

      sendEvent(
        'simpleDiceRoll',
        Object.entries(dices)
          .filter(([, count]) => count > 0)
          .map(([dice, count]) => `${count}D${dice}`)
          .join('+'),
      );

      setOutput({
        key: Date.now().toString(36) + Math.random().toString(36).slice(2),
        ...result,
      });
    },
    [sendEvent, setOutput, simpleDiceRollCore],
  );

  return { simpleDiceRoll };
};

export const formatSimpleDices = (dices: Partial<SimpleDices>) =>
  Object.entries(dices)
    .filter(([, count]) => count > 0)
    .map(([dice, count]) => `${count}D${dice}`)
    .join(' + ');
