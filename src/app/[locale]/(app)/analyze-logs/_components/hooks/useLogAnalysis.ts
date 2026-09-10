import { atom, useAtom, useAtomValue } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { useCallback, useEffect } from 'react';

import { analyzeCcfoliaLog } from '@/features/log-analysis/ccfolia';
import { detectSystem } from '@/features/log-analysis/ccfolia/detector';
import {
  importLogFile,
  LogImportError,
  type ImportedLogFile,
  type LogImportErrorCode,
} from '@/features/log-analysis/ccfolia/importLogFile';
import { systemStats } from '@/features/log-analysis/ccfolia/messageParser';
import { mergeStructuredLogs } from '@/features/log-analysis/ccfolia/structuredLog';
import type { DiceResultForCharacter, System } from '@/features/log-analysis/model';
import { round } from '@/shared/lib/round';
import { captureClientException } from '@/shared/lib/sentryClient';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

import { ALL_CHARACTER_ID } from '../constants';

const logFilesAtom = atom<ImportedLogFile[]>([]);
const importingLogsAtom = atom(false);
const mergedLogsAtom = atom((get) => mergeStructuredLogs(get(logFilesAtom).map(({ logs }) => logs)));
const importLogsAtom = atom(null, async (get, set, files: File[]) => {
  if (get(importingLogsAtom)) return [];
  set(importingLogsAtom, true);
  const errors: { name: string; code: LogImportErrorCode }[] = [];
  const importedFiles: ImportedLogFile[] = [];
  try {
    for (const file of files) {
      try {
        const imported = await importLogFile(file);
        importedFiles.push(imported);
      } catch (error) {
        errors.push({ name: file.name, code: error instanceof LogImportError ? error.code : 'read' });
      }
    }
    if (importedFiles.length > 0) {
      set(logFilesAtom, (previous) => [...previous, ...importedFiles]);
      set(selectedLogTabsAtom, null);
    }
  } finally {
    set(importingLogsAtom, false);
  }
  return errors;
});

const selectedLogTabsAtom = atom<string[] | null>(null);

const logTabOptionsAtom = atom((get) => {
  const { logs } = get(mergedLogsAtom);
  if (logs.length === 0) return [];

  try {
    return takeUnique(logs.map(({ tab }) => tab));
  } catch (err) {
    console.error('Failed to parse log tabs:', err);
    return [];
  }
});

const logAnalysisSystemAtom = withAtomEffect(atom<System | null>(null), (get, set) => {
  const { logs } = get(mergedLogsAtom);

  if (logs.length === 0) {
    set(logAnalysisSystemAtom, null);
    return;
  }

  try {
    const detectedSystem = detectSystem(logs);
    set(logAnalysisSystemAtom, detectedSystem);
  } catch (err) {
    set(logAnalysisSystemAtom, null);
    console.error('Failed to detect system:', err);
  }
});

type LogAnalysisResult = LogAnalysisSuccess | LogAnalysisError | null;

type LogAnalysisSuccess = {
  type: 'success';
  results: DiceResultForCharacter[];
};

type LogAnalysisError = {
  type: 'error';
};

const expectedAnalysisErrorMessages = new Set(['Invalid log format', 'No logs detected', 'No valid dice rolls found']);

const logAnalysisResultAtom = atom<LogAnalysisResult>((get) => {
  const { logs } = get(mergedLogsAtom);
  const system = get(logAnalysisSystemAtom);
  const selectedTabs = get(selectedLogTabsAtom);
  const tabs = selectedTabs ?? undefined;

  if (logs.length === 0 || system === null) return null;
  if (selectedTabs !== null && selectedTabs.length === 0) return null;
  try {
    const result = analyzeCcfoliaLog(system, logs, tabs);
    return { type: 'success', results: result };
  } catch (err) {
    console.error('Failed to analyze log:', err);
    if (!(err instanceof Error) || !expectedAnalysisErrorMessages.has(err.message)) captureClientException(err);
    return { type: 'error' };
  }
});

const systemStatsAtom = atom((get) => {
  const system = get(logAnalysisSystemAtom);
  if (system === null) return null;
  return systemStats[system];
});

export const useLogFiles = () => {
  const [logFiles, setLogFiles] = useAtom(logFilesAtom);
  const [isImporting] = useAtom(importingLogsAtom);
  const [, importFiles] = useAtom(importLogsAtom);
  const { duplicateCount } = useAtomValue(mergedLogsAtom);
  return {
    logFiles,
    setLogFiles,
    isImporting,
    importFiles,
    duplicateCount: duplicateCount + logFiles.reduce((sum, file) => sum + file.duplicateCount, 0),
  };
};

export const useLogTabSelect = () => {
  const tabs = useAtomValue(logTabOptionsAtom);
  const [selectedTabs, setSelectedTabs] = useAtom(selectedLogTabsAtom);
  const enabledTabs = selectedTabs ?? tabs;

  const toggleTab = useCallback(
    (tab: string) => {
      setSelectedTabs((prev) => {
        const current = prev ?? tabs;
        const next = current.includes(tab) ? current.filter((selectedTab) => selectedTab !== tab) : [...current, tab];
        if (next.length === tabs.length) return null;
        return next;
      });
    },
    [setSelectedTabs, tabs],
  );

  const setAllTabsSelected = useCallback(
    (checked: boolean) => {
      setSelectedTabs(checked ? null : []);
    },
    [setSelectedTabs],
  );

  const resetSelectedTabs = useCallback(() => {
    setSelectedTabs(null);
  }, [setSelectedTabs]);

  return {
    tabs,
    enabledTabs,
    toggleTab,
    setAllTabsSelected,
    resetSelectedTabs,
  };
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

    const allResult = result.results.find((p) => p.id === ALL_CHARACTER_ID);
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
    changeSystem: (system: System | null) => setSystem(system),
  };
};

const takeUnique = <T>(array: T[]) => Array.from(new Set(array));
