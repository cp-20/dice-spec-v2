import { describe, expect, test } from 'bun:test';

import { Timestamp } from 'firebase/firestore';

import { parseAnalysisDocument } from './schema';

const validAnalysis = () => ({
  id: 'analysis_1',
  title: 'Session',
  ownerUid: 'user_1',
  systemId: 'CoC7th',
  visibilityLevel: 'public',
  showRecordDetails: true,
  characterResults: [
    {
      id: 'all',
      name: '[ALL]',
      summary: {
        average: 50,
        deviationScore: 52,
        successRate: 60,
        diceRollCount: 10,
        diceCount: 10,
      },
      summaryRecords: [],
    },
  ],
  sessionDate: Timestamp.now(),
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  primaryDeviationScore: 52,
  owner: {
    id: 'user_1',
    name: 'Alice',
    plan: 'free',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
});

describe('parseAnalysisDocument', () => {
  test('全体集計を先頭に持つ正しい解析を読み込める', () => {
    expect(parseAnalysisDocument(validAnalysis())).not.toBeNull();
  });

  test('全体集計がない解析は一覧全体を壊さず無効として扱う', () => {
    expect(parseAnalysisDocument({ ...validAnalysis(), characterResults: [] })).toBeNull();
  });

  test('主偏差値と全体集計の偏差値が一致しない解析は無効として扱う', () => {
    expect(parseAnalysisDocument({ ...validAnalysis(), primaryDeviationScore: 99 })).toBeNull();
  });
});
