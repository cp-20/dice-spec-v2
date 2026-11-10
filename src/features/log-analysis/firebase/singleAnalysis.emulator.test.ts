import { waitFor } from '@testing-library/react';
import { signInAnonymously, signOut } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { createStore } from 'jotai';

import { getFirebaseAuth } from '@/shared/lib/firebase/client';
import { setupFirebaseIntegration } from '@/test/firebase';

import { analysisAtomFamily } from './singleAnalysis';

const firebase = setupFirebaseIntegration();
const createdAt = Timestamp.fromMillis(1_000);

test('未ログインで開けなかった解析を、ログイン状態が変わると読み込み直す', async () => {
  const analysisAtom = analysisAtomFamily('analysis-1');
  const store = createStore();
  await signOut(getFirebaseAuth());
  const unsubscribe = store.sub(analysisAtom, () => {});

  // 存在しない解析と非公開の解析は、どちらも権限エラーとして購読が終了する。
  await waitFor(() => expect(store.get(analysisAtom)).toEqual({ analysis: null, loading: false, error: null }));

  await firebase.seed('analyses/analysis-1', {
    id: 'analysis-1',
    title: 'Session 1',
    ownerUid: 'owner',
    systemId: 'CoC7th',
    visibilityLevel: 'public',
    showRecordDetails: false,
    characterResults: [
      {
        id: 'all',
        name: '全体',
        summary: { average: 50, deviationScore: 0, successRate: 50, diceRollCount: 1, diceCount: 1 },
        summaryRecords: [],
      },
    ],
    sessionDate: createdAt,
    createdAt,
    updatedAt: createdAt,
    primaryDeviationScore: 0,
    owner: { id: 'owner', name: 'Owner', plan: 'free', createdAt, updatedAt: createdAt },
  });
  await signInAnonymously(getFirebaseAuth());

  await waitFor(() => expect(store.get(analysisAtom).analysis?.title).toBe('Session 1'));
  unsubscribe();
});
