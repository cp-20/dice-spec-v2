import { atom, useAtom, useAtomValue } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { useCallback, useEffect } from 'react';

import { round } from '@/shared/lib/round';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

import { ALL_CHARACTER_ID } from '../constants';
import { analyzeCcfoliaLog, type DiceResultForCharacter, type System } from './ccfoliaLogAnalysis';
import { detectSystem } from './ccfoliaLogAnalysis/detector';
import { parseHtmlLog } from './ccfoliaLogAnalysis/htmlParser';
import { systemStats } from './ccfoliaLogAnalysis/messageParser';

type LogFile = {
  name: string;
  content: string;
};

const logFilesAtom = atom<LogFile[]>([]);

const mergeLogContents = (contents: string[]) => {
  if (contents.length <= 1) return contents[0] ?? '';

  const parser = new DOMParser();
  const mergedLogs = contents
    .flatMap((content) => Array.from(parser.parseFromString(content, 'text/html').querySelectorAll('body > p')))
    .map((el) => el.outerHTML)
    .join('\n');

  return `<html><body>${mergedLogs}</body></html>`;
};

const fileContentAtom = atom((get) => mergeLogContents(get(logFilesAtom).map(({ content }) => content)));
const selectedLogTabsAtom = atom<string[] | null>(null);

const logTabOptionsAtom = atom((get) => {
  const fileContent = get(fileContentAtom);
  if (fileContent === '') return [];

  try {
    return takeUnique(parseHtmlLog(fileContent).map(({ tab }) => tab));
  } catch (err) {
    console.error('Failed to parse log tabs:', err);
    return [];
  }
});

const logAnalysisSystemAtom = withAtomEffect(atom<System | null>(null), (get, set) => {
  const fileContent = get(fileContentAtom);

  if (fileContent === '') {
    set(logAnalysisSystemAtom, null);
    return;
  }

  try {
    const detectedSystem = detectSystem(fileContent);
    set(logAnalysisSystemAtom, detectedSystem);
  } catch (err) {
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

const logAnalysisResultAtom = atom<LogAnalysisResult>((get) => {
  const fileContent = get(fileContentAtom);
  const system = get(logAnalysisSystemAtom);
  const selectedTabs = get(selectedLogTabsAtom);
  const tabs = selectedTabs ?? undefined;

  if (fileContent === '' || system === null) return null;
  if (selectedTabs !== null && selectedTabs.length === 0) return null;
  try {
    const result = analyzeCcfoliaLog(system, fileContent, tabs);
    return { type: 'success', results: result };
  } catch (err) {
    console.error('Failed to analyze log:', err);
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
  return { logFiles, setLogFiles };
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
