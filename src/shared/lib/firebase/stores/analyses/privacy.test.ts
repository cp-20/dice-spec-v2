import { describe, expect, test } from 'bun:test';

import { shouldCloseAnalysisRecordsBeforeFirestore } from './privacy';

describe('shouldCloseAnalysisRecordsBeforeFirestore', () => {
  test('公開中の記録を非公開にするときは Storage を先に閉じる', () => {
    expect(
      shouldCloseAnalysisRecordsBeforeFirestore(
        { visibilityLevel: 'public', showRecordDetails: true },
        { visibilityLevel: 'private', showRecordDetails: true },
      ),
    ).toBe(true);
  });

  test('記録を公開するときは Firestore の更新を先にする', () => {
    expect(
      shouldCloseAnalysisRecordsBeforeFirestore(
        { visibilityLevel: 'private', showRecordDetails: true },
        { visibilityLevel: 'public', showRecordDetails: true },
      ),
    ).toBe(false);
  });
});
