import { atom, useAtom } from 'jotai';
import type { AvailableDice } from './useSimpleDiceInput';

export type simpleDiceOutputAtom = {
  key: string;
  result: { dice: AvailableDice; result: number[] }[];
  sum: number;
  resultStr: string;
};

const simpleDiceOutputAtom = atom<simpleDiceOutputAtom | null>(null);

export const useSimpleDiceOutput = () => {
  const [simpleDiceOutput, setSimpleDiceOutput] = useAtom(simpleDiceOutputAtom);

  return { simpleDiceOutput, setSimpleDiceOutput };
};
