import { describe, expect, test } from 'bun:test';

import { Timestamp } from 'firebase/firestore';
import * as v from 'valibot';

import { userDocumentSchema } from './schema';

describe('userDocumentSchema', () => {
  test('保存機能追加前のユーザーはCCFOLIA保存件数0として読み込む', () => {
    const timestamp = Timestamp.fromDate(new Date('2026-08-28T00:00:00.000Z'));
    const user = v.parse(userDocumentSchema, {
      id: 'legacy-user',
      name: 'Legacy User',
      plan: 'free',
      createdAt: timestamp,
      updatedAt: timestamp,
      stripeCustomerId: '',
      analysisCount: 0,
      analysisCountSyncAnalysisId: null,
    });

    expect(user.ccfoliaCharacterCount).toBe(0);
    expect(user.ccfoliaCharacterCountSyncCharacterId).toBeNull();
  });
});
