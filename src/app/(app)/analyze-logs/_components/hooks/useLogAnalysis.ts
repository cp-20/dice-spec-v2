import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { useCallback } from 'react';

import { analyzeCcfoliaLog } from '@/features/log-analysis/ccfolia';
import { detectSystem } from '@/features/log-analysis/ccfolia/detector';
import {
  importLogFile,
  LogImportError,
  type ImportedLogFile,
  type LogImportErrorCode,
} from '@/features/log-analysis/ccfolia/importLogFile';
import { mergeStructuredLogs } from '@/features/log-analysis/ccfolia/structuredLog';
import type { DiceResultForCharacter, System } from '@/features/log-analysis/model';
import { round } from '@/shared/lib/round';
import { captureClientException } from '@/shared/lib/sentryClient';
import { sendGoogleAnalyticsEvent } from '@/shared/lib/useGoogleAnalytics';

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

const detectedSystemAtom = atom((get) => {
  const { logs } = get(mergedLogsAtom);
  if (logs.length === 0) return null;

  try {
    return detectSystem(logs);
  } catch (err) {
    console.error('Failed to detect system:', err);
    return null;
  }
});

// ユーザーが選んだシステムは、ログを追加しても自動判定で上書きしない。ログを消すまで保持する。
const selectedSystemAtom = atom<System | null>(null);
const logAnalysisSystemAtom = atom(
  (get) => get(selectedSystemAtom) ?? get(detectedSystemAtom),
  (_get, set, system: System | null) => set(selectedSystemAtom, system),
);

type LogAnalysisResult = LogAnalysisSuccess | LogAnalysisError | null;

type LogAnalysisSuccess = {
  type: 'success';
  results: DiceResultForCharacter[];
};

type LogAnalysisError = {
  type: 'error';
};

const expectedAnalysisErrorMessages = new Set(['Invalid log format', 'No logs detected', 'No valid dice rolls found']);

const analyzedResultAtom = atom<LogAnalysisResult>((get) => {
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

// 解析結果を読む箇所の数に関わらず、結果が変わるたびに1回だけ計測する。
const logAnalysisResultAtom = withAtomEffect(analyzedResultAtom, (get) => {
  const result = get(analyzedResultAtom);
  if (result === null) return;

  if (result.type === 'error') {
    sendGoogleAnalyticsEvent('analyzeLogsError');
    return;
  }

  const system = get(logAnalysisSystemAtom);
  const allResult = result.results.find((p) => p.id === ALL_CHARACTER_ID);
  if (allResult === undefined || system === null) return;

  const { average, deviationScore, successRate, diceRollCount } = allResult.summary;
  sendGoogleAnalyticsEvent('analyzeLogs', [
    system,
    `${round(average, 3)}`,
    `${round(deviationScore, 3)}`,
    `${round(successRate, 3)}`,
    `${diceRollCount}`,
  ]);
});

// 選択中のキャラクターが解析結果に含まれなくなったら、全体の集計へ戻す。
const selectedCharacterAtom = atom<string>(ALL_CHARACTER_ID);
export const logAnalysisCharacterAtom = atom(
  (get) => {
    const result = get(logAnalysisResultAtom);
    const selected = get(selectedCharacterAtom);
    return result?.type === 'success' && result.results.some(({ id }) => id === selected) ? selected : ALL_CHARACTER_ID;
  },
  (_get, set, character: string) => set(selectedCharacterAtom, character),
);

const clearLogsAtom = atom(null, (_get, set) => {
  set(logFilesAtom, []);
  set(selectedLogTabsAtom, null);
  set(selectedSystemAtom, null);
  set(selectedCharacterAtom, ALL_CHARACTER_ID);
});

export const useLogFiles = () => {
  const logFiles = useAtomValue(logFilesAtom);
  const isImporting = useAtomValue(importingLogsAtom);
  const importFiles = useSetAtom(importLogsAtom);
  const clearLogs = useSetAtom(clearLogsAtom);
  return {
    logFiles,
    isImporting,
    importFiles,
    clearLogs,
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

  return {
    tabs,
    enabledTabs,
    toggleTab,
    setAllTabsSelected,
  };
};

export const useLogAnalysis = () => {
  const result = useAtomValue(logAnalysisResultAtom);
  const system = useAtomValue(logAnalysisSystemAtom);

  return {
    result,
    system,
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
