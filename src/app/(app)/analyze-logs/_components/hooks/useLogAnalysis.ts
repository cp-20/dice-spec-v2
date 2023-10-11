import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';
import { analyzeCcfoliaLog, type CharacterResult } from './ccfoliaLogAnalysis';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

const resultAtom = atom<CharacterResult[]>([]);

export const useLogAnalysis = () => {
  const [result, setResult] = useAtom(resultAtom);
  const { sendEvent } = useGoogleAnalytics();

  const analyze = useCallback(
    (html: string) => {
      const result = analyzeCcfoliaLog(html);
      setResult(result);
      sendEvent(
        'analyzeLogs: average',
        `${result.find((p) => p.id === 'all')?.diceResultSummary.average}`,
      );
      sendEvent(
        'analyzeLogs: deviationScore',
        `${result.find((p) => p.id === 'all')?.diceResultSummary
          .deviationScore}`,
      );
      sendEvent(
        'analyzeLogs: successRate',
        `${result.find((p) => p.id === 'all')?.diceResultSummary.successRate}`,
      );
      sendEvent(
        'analyzeLogs: diceRollCount',
        `${result.find((p) => p.id === 'all')?.diceResultSummary
          .diceRollCount}`,
      );
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
