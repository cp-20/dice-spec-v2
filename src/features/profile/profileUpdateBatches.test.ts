import { describe, expect, test } from 'bun:test';

import { MAX_ANALYSES_PER_PROFILE_BATCH, splitProfileUpdateBatches } from './profileUpdateBatches';

describe('splitProfileUpdateBatches', () => {
  test('解析がなくてもユーザー更新用のバッチを1つ返す', () => {
    expect(splitProfileUpdateBatches([])).toEqual([[]]);
  });

  test('ユーザー更新を含めてFirestoreの500書き込み上限を超えない', () => {
    const analyses = Array.from({ length: MAX_ANALYSES_PER_PROFILE_BATCH + 1 }, (_, index) => index);

    expect(splitProfileUpdateBatches(analyses).map((batch) => batch.length)).toEqual([
      MAX_ANALYSES_PER_PROFILE_BATCH,
      1,
    ]);
  });
});
