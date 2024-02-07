import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';
import { analyzeCcfoliaLog, type CharacterResult } from './ccfoliaLogAnalysis';
import { round } from '@/shared/lib/round';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

const resultAtom = atom<CharacterResult[]>([]);

export const useLogAnalysis = () => {
  const [result, setResult] = useAtom(resultAtom);
  const { sendEvent } = useGoogleAnalytics();

  const analyze = useCallback(
    (html: string) => {
      const result = analyzeCcfoliaLog(html);
      setResult(result);

      const allResult = result.find((p) => p.id === 'all');
      if (allResult === undefined) return;

      const { average, deviationScore, successRate, diceRollCount } =
        allResult.diceResultSummary;
      sendEvent('analyzeLogs', [
        `${round(average, 3)}`,
        `${round(deviationScore, 3)}`,
        `${round(successRate, 3)}`,
        `${diceRollCount}`,
      ]);
    },
    [sendEvent, setResult],
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
