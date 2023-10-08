import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';
import { useSimpleDiceRoll } from './useSimpleDiceRoll';

export const availableDice = [
  '3',
  '4',
  '6',
  '8',
  '10',
  '12',
  '20',
  '100',
] as const;

export type AvailableDice = (typeof availableDice)[number];

export type SimpleDices = Record<AvailableDice, number>;

const simpleDicesAtom = atom<SimpleDices>({
  3: 0,
  4: 0,
  6: 0,
  8: 0,
  10: 0,
  12: 0,
  20: 0,
  100: 0,
});

export const useSimpleDiceInput = () => {
  const { simpleDiceRoll } = useSimpleDiceRoll();
  const [simpleDices, setSimpleDices] = useAtom(simpleDicesAtom);

  const incrementDice = useCallback(
    (dice: AvailableDice) => {
      setSimpleDices((prev) => ({
        ...prev,
        [dice]: Math.min(prev[dice] + 1, 999),
      }));
    },
    [setSimpleDices],
  );

  const decrementDice = useCallback(
    (dice: AvailableDice) => {
      setSimpleDices((prev) => ({
        ...prev,
        [dice]: Math.max(prev[dice] - 1, 0),
      }));
    },
    [setSimpleDices],
  );

  const resetDice = useCallback(() => {
    setSimpleDices({
      3: 0,
      4: 0,
      6: 0,
      8: 0,
      10: 0,
      12: 0,
      20: 0,
      100: 0,
    });
  }, [setSimpleDices]);

  const rollDice = useCallback(
    () => simpleDiceRoll(simpleDices),
    [simpleDiceRoll, simpleDices],
  );

  return {
    simpleDices,
    incrementDice,
    decrementDice,
    resetDice,
    rollDice,
  };
};
