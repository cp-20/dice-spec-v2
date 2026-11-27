import { titleFromLogFileName } from './AnalysisSavePanel';

test('ココフォリアのログのファイル名から保存タイトルの初期値を作る', () => {
  expect(titleFromLogFileName('狂気山脈[main].html')).toBe('狂気山脈');
  expect(titleFromLogFileName('セッションログ.json')).toBe('セッションログ');
  expect(titleFromLogFileName('')).toBe('');
});
