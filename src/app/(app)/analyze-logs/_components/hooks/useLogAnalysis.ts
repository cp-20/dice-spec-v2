import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';
import { analyzeCcfoliaLog, type CharacterResult } from './ccfoliaLogAnalysis';

const resultAtom = atom<CharacterResult[]>([]);

export const useLogAnalysis = () => {
  const [result, setResult] = useAtom(resultAtom);

  const analyze = useCallback(
    (html: string) => {
      const result = analyzeCcfoliaLog(html);
      setResult(result);
    },
    [setResult],
  );

  const reset = useCallback(() => {
    setResult([]);
  }, [setResult]);

  return {
    result,
    analyze,
    reset,
  };
};
