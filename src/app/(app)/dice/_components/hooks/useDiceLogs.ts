import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

export type DiceLog = {
  key: string;
  system: string;
  log: string;
  variant: 'success' | 'failed' | 'default';
};

const diceLogsAtom = atom<DiceLog[]>([]);

export const useDiceLogs = () => {
  const [diceLogs, setDiceLogs] = useAtom(diceLogsAtom);

  const addDiceLog = useCallback(
    (log: DiceLog) => {
      setDiceLogs((prev) => [log, ...prev]);
    },
    [setDiceLogs],
  );

  return { diceLogs, addDiceLog };
};
