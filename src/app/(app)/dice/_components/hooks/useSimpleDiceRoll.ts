import { useCallback } from 'react';
import type {
  AvailableDice,
  SimpleDices,
} from '@/app/(app)/dice/_components/hooks/useSimpleDiceInput';
import { useSimpleDiceOutput } from '@/app/(app)/dice/_components/hooks/useSimpleDiceOutput';

export const useSimpleDiceRollCore = () => {
  const simpleDiceRoll = useCallback((dices: Partial<SimpleDices>) => {
    const validDices = Object.entries(dices).filter(([, count]) => count > 0);
    if (validDices.length === 0) return null;

    const inputStr = validDices
      .map(([dice, count]) => `${count}D${dice}`)
      .join(' + ');

    const result = validDices.map(([dice, count]) => ({
      dice: dice as AvailableDice,
      result: [...Array(count)].map(
        () => Math.floor(Math.random() * Number(dice)) + 1,
      ),
    }));

    const allSum = sum(result.map(({ result }) => sum(result)));

    const resultStr = [
      inputStr,
      result
        .map(({ result }) => `${sum(result)}[${result.join(', ')}]`)
        .join(' + '),
      allSum,
    ].join(' => ');

    return { result, sum: allSum, resultStr };
  }, []);

  return { simpleDiceRoll };
};

const sum = (arr: number[]) => arr.reduce((acc, curr) => acc + curr, 0);

export const useSimpleDiceRoll = () => {
  const { simpleDiceRoll: simpleDiceRollCore } = useSimpleDiceRollCore();
  const { setSimpleDiceOutput } = useSimpleDiceOutput();

  const simpleDiceRoll = useCallback(
    (dices: Partial<SimpleDices>) => {
      const result = simpleDiceRollCore(dices);
      if (result === null) return;

      setSimpleDiceOutput({
        key: Date.now().toString(36) + Math.random().toString(36).slice(2),
        ...result,
      });
    },
    [setSimpleDiceOutput, simpleDiceRollCore],
  );

  return { simpleDiceRoll };
};

export const formatSimpleDices = (dices: Partial<SimpleDices>) =>
  Object.entries(dices)
    .filter(([, count]) => count > 0)
    .map(([dice, count]) => `${count}D${dice}`)
    .join(' + ');
