import { atom, useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { systemStats } from '@/app/[locale]/(app)/analyze-logs/_components/hooks/ccfoliaLogAnalysis/messageParser';
import { round } from '@/shared/lib/round';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';
import { analyzeCcfoliaLog, type DiceResultForCharacter, type System } from './ccfoliaLogAnalysis';
import { detectSystem } from './ccfoliaLogAnalysis/detector';
import { useFileContent } from './useFileContent';

const resultAtom = atom<DiceResultForCharacter[]>([]);
const systemAtom = atom<System | null>(null);

export const useLogAnalysis = () => {
  const { fileContent } = useFileContent();

  const [result, setResult] = useAtom(resultAtom);
  const [system, setSystem] = useAtom(systemAtom);
  const { sendEvent } = useGoogleAnalytics();

  const analyze = useCallback(
    (html: string) => {
      if (system === null) return;
      const result = analyzeCcfoliaLog(system, html);
      setResult(result);

      const allResult = result.find((p) => p.id === 'all');
      if (allResult === undefined) return;

      const { average, deviationScore, successRate, diceRollCount } = allResult.summary;
      sendEvent('analyzeLogs', [
        system,
        `${round(average, 3)}`,
        `${round(deviationScore, 3)}`,
        `${round(successRate, 3)}`,
        `${diceRollCount}`,
      ]);
    },
    [system, sendEvent, setResult],
  );

  const reset = useCallback(() => {
    setResult([]);
  }, [setResult]);

  useEffect(() => {
    if (fileContent === '') return;
    setSystem(detectSystem(fileContent));
  }, [fileContent, setSystem]);

  useEffect(() => {
    if (fileContent === '') {
      reset();
      return;
    }
    analyze(fileContent);
  }, [fileContent, analyze, reset]);

  return {
    result,
    system,
    systemStats: system ? systemStats[system] : null,
    analyze,
    reset,
  };
};

export const useLogAnalysisSystem = () => {
  const [system, setSystem] = useAtom(systemAtom);

  const changeSystem = useCallback(
    (system: System) => {
      setSystem(system);
    },
    [setSystem],
  );

  return {
    system,
    changeSystem,
  };
};
