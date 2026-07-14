import { describe, expect, test } from 'bun:test';

import {
  initialPageProgress,
  markPageFailed,
  markPageLoaded,
  requestNextPage,
  resetLoadedPages,
  retryPage,
  shouldFetchPage,
} from './pageProgress';

describe('page progress', () => {
  test('初回と追加要求の分だけ順に読み込む', () => {
    let progress = requestNextPage(initialPageProgress());
    expect(shouldFetchPage(progress)).toBe(true);

    progress = markPageLoaded(progress, true);
    expect(shouldFetchPage(progress)).toBe(true);

    progress = markPageLoaded(progress, false);
    expect(shouldFetchPage(progress)).toBe(false);
  });

  test('失敗時は自動再試行せず、明示的な再試行で再開する', () => {
    const failed = markPageFailed(initialPageProgress());
    expect(shouldFetchPage(failed)).toBe(false);
    expect(shouldFetchPage(retryPage(failed))).toBe(true);
  });

  test('無効化後は要求済みページ数を保って先頭から読み直す', () => {
    const loaded = markPageLoaded(requestNextPage(initialPageProgress()), true);
    const reset = resetLoadedPages(loaded);

    expect(reset.requestedPages).toBe(2);
    expect(shouldFetchPage(reset)).toBe(true);
  });
});
