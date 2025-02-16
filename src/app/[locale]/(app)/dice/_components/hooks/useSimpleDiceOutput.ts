import { atom, useAtom } from 'jotai';
import type { AvailableDice } from './useSimpleDiceInput';

export type simpleDiceOutputAtom = {
  key: string;
  result: { dice: AvailableDice; result: number[] }[];
  sum: number;
  resultStr: string;
};

const simpleDiceOutputHistoryAtom = atom<simpleDiceOutputAtom[]>([]);

export const useSimpleDiceOutput = () => {
  const [history, setHistory] = useAtom(simpleDiceOutputHistoryAtom);
  const setOutput = (output: simpleDiceOutputAtom) => {
    setHistory((prev) => [...prev, output]);
  };
  const latestOutput = history[history.length - 1] ?? null;
  return { latestOutput, history, setOutput };
};
