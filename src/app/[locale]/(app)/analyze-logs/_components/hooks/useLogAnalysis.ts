import { atom, useAtom, useAtomValue } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { useEffect } from 'react';
import { round } from '@/shared/lib/round';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';
import { analyzeCcfoliaLog, type DiceResultForCharacter, type System } from './ccfoliaLogAnalysis';
import { detectSystem } from './ccfoliaLogAnalysis/detector';
import { systemStats } from './ccfoliaLogAnalysis/messageParser';

const fileContentAtom = atom<string>('');

const logAnalysisSystemAtom = withAtomEffect(atom<System | null>(null), (get, set) => {
  const fileContent = get(fileContentAtom);

  if (fileContent === '') {
    set(logAnalysisSystemAtom, null);
    return;
  }

  try {
    const detectedSystem = detectSystem(fileContent);
    set(logAnalysisSystemAtom, detectedSystem);
  } catch (_) {}
});

type LogAnalysisResult = LogAnalysisSuccess | LogAnalysisError | null;

type LogAnalysisSuccess = {
  type: 'success';
  results: DiceResultForCharacter[];
};

type LogAnalysisError = {
  type: 'error';
};

const logAnalysisResultAtom = atom<LogAnalysisResult>((get) => {
  const fileContent = get(fileContentAtom);
  const system = get(logAnalysisSystemAtom);

  if (fileContent === '' || system === null) return null;
  try {
    const result = analyzeCcfoliaLog(system, fileContent);
    return { type: 'success', results: result };
  } catch (_) {
    return { type: 'error' };
  }
});

const systemStatsAtom = atom((get) => {
  const system = get(logAnalysisSystemAtom);
  if (system === null) return null;
  return systemStats[system];
});

export const useFileContent = () => {
  const [fileContent, setFileContent] = useAtom(fileContentAtom);
  return { fileContent, setFileContent };
};

export const useLogAnalysis = () => {
  const result = useAtomValue(logAnalysisResultAtom);
  const system = useAtomValue(logAnalysisSystemAtom);
  const systemStats = useAtomValue(systemStatsAtom);
  const { sendEvent } = useGoogleAnalytics();

  useEffect(() => {
    if (result === null) return;

    if (result.type === 'error') {
      sendEvent('analyzeLogsError');
      return;
    }

    const allResult = result.results.find((p) => p.id === 'all');
    if (allResult === undefined || system === null) return;

    const { average, deviationScore, successRate, diceRollCount } = allResult.summary;
    sendEvent('analyzeLogs', [
      system,
      `${round(average, 3)}`,
      `${round(deviationScore, 3)}`,
      `${round(successRate, 3)}`,
      `${diceRollCount}`,
    ]);
  }, [result, system, sendEvent]);

  return {
    result,
    system,
    systemStats,
  };
};

export const useLogAnalysisSystem = () => {
  const [system, setSystem] = useAtom(logAnalysisSystemAtom);

  return {
    system,
    changeSystem: () => setSystem(system),
  };
};
