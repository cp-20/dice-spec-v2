import { atom, useAtom } from 'jotai';
import type { AvailableDice } from './useSimpleDiceInput';

export type simpleDiceOutputAtom = {
  key: string;
  result: { dice: AvailableDice; result: number[] }[];
  sum: number;
  resultStr: string;
};

const simpleDiceOutputAtom = atom<[simpleDiceOutputAtom | null]>([null]);

export const useSimpleDiceOutput = () => {
  const [[simpleDiceOutput], setter] = useAtom(simpleDiceOutputAtom);

  const setSimpleDiceOutput = (output: simpleDiceOutputAtom) => {
    setter([output]);
  };

  return { simpleDiceOutput, setSimpleDiceOutput };
};
