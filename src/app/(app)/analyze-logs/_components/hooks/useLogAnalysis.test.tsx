import { readFileSync } from 'node:fs';

import { act, renderHook } from '@testing-library/react';
import { Provider } from 'jotai';

import { ALL_CHARACTER_ID } from '../constants';
import { useCharacterSelect } from './useCharacterSelect';
import { useLogAnalysis, useLogAnalysisSystem, useLogFiles, useLogTabSelect } from './useLogAnalysis';

const logFile = (name: string) =>
  new File(
    [readFileSync(new URL('../../../../../features/log-analysis/ccfolia/fixtures/new.json', import.meta.url), 'utf8')],
    name,
  );

const useAnalysisPage = () => ({
  files: useLogFiles(),
  tabs: useLogTabSelect(),
  system: useLogAnalysisSystem(),
  character: useCharacterSelect(),
  analysis: useLogAnalysis(),
  // 画面では複数の部品が同じ解析結果を読む。
  sameAnalysis: useLogAnalysis(),
});

test('自動判定したシステムと選択を、ログの追加・絞り込み・削除を通して一貫して保つ', async () => {
  window.dataLayer = [];
  const { result } = renderHook(useAnalysisPage, { wrapper: Provider });
  const analyzeEvents = () => window.dataLayer.filter((event) => (event as unknown[])[1] === 'analyzeLogs');

  await act(() => result.current.files.importFiles([logFile('first.json')]));
  expect(result.current.system.system).toBe('CoC7th');
  expect(result.current.analysis.result?.type).toBe('success');
  // 解析結果を読む箇所が複数あっても、計測は1回だけ送る。
  expect(analyzeEvents()).toHaveLength(1);

  // 手動で選んだシステムは、ログを追加しても自動判定で上書きされない。
  act(() => result.current.system.changeSystem('CoC6th'));
  await act(() => result.current.files.importFiles([logFile('second.json')]));
  expect(result.current.files.logFiles).toHaveLength(2);
  expect(result.current.system.system).toBe('CoC6th');

  act(() => result.current.system.changeSystem('CoC7th'));
  act(() => result.current.character.selectCharacter('character-相棒'));
  expect(result.current.character.character).toBe('character-相棒');

  // 選択中のキャラクターの判定がないタブへ絞り込むと、全体の集計へ戻る。
  act(() => result.current.tabs.toggleTab('[info]'));
  expect(result.current.analysis.result?.type).toBe('success');
  expect(result.current.character.character).toBe(ALL_CHARACTER_ID);

  // 絞り込みを戻すと、選んでいたキャラクターへ戻る。
  act(() => result.current.tabs.toggleTab('[info]'));
  expect(result.current.character.character).toBe('character-相棒');

  act(() => result.current.system.changeSystem('CoC6th'));
  act(() => result.current.files.clearLogs());
  expect(result.current.files.logFiles).toHaveLength(0);
  expect(result.current.system.system).toBeNull();
  expect(result.current.analysis.result).toBeNull();

  // 削除後に読み込んだログは、前回の手動選択やキャラクター選択を引き継がない。
  await act(() => result.current.files.importFiles([logFile('third.json')]));
  expect(result.current.system.system).toBe('CoC7th');
  expect(result.current.character.character).toBe(ALL_CHARACTER_ID);
});
