import { atom, useAtom } from 'jotai';

type simpleDiceOutputAtom = {
  key: string;
  // dice はダイスの面数
  result: { dice: string; result: number[] }[];
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
