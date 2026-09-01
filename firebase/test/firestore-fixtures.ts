import { doc, increment, serverTimestamp, Timestamp, writeBatch } from 'firebase/firestore';

import type { SeedDocument, TestFirestore } from './rules-test-environment';

export const now = Timestamp.fromDate(new Date('2026-03-18T00:00:00.000Z'));

export const userDoc = (overrides: Record<string, unknown> = {}) => ({
  id: 'user_1',
  name: 'Alice',
  avatarUrl: 'https://example.com/avatar.png',
  plan: 'free',
  createdAt: now,
  updatedAt: now,
  stripeCustomerId: '',
  stripeSubscriptionId: '',
  analysisCount: 0,
  analysisCountSyncAnalysisId: null,
  ccfoliaCharacterCount: 0,
  ccfoliaCharacterCountSyncCharacterId: null,
  ...overrides,
});

export const ownerSnapshot = (overrides: Record<string, unknown> = {}) => ({
  id: 'user_1',
  name: 'Alice',
  avatarUrl: 'https://example.com/avatar.png',
  plan: 'free',
  createdAt: now,
  updatedAt: now,
  ...overrides,
});

export const analysisDoc = (analysisId: string, ownerUid: string, overrides: Record<string, unknown> = {}) => ({
  id: analysisId,
  title: 'Session 1',
  ownerUid,
  systemId: 'CoC7th',
  visibilityLevel: 'private',
  showRecordDetails: false,
  characterResults: [{ id: 'all', summary: { deviationScore: 0 } }],
  sessionDate: now,
  createdAt: now,
  updatedAt: now,
  primaryDeviationScore: 0,
  owner: ownerSnapshot({ id: ownerUid }),
  ...overrides,
});

export const ccfoliaCharacterDoc = (characterId: string, overrides: Record<string, unknown> = {}) => ({
  id: characterId,
  schemaVersion: 1,
  revision: 1,
  name: '探索者A',
  memo: 'メモ',
  initiative: 12,
  externalUrl: 'https://example.com/character',
  status: [{ label: 'HP', value: 10, max: 12 }],
  params: [{ label: 'STR', value: '50' }],
  color: '#888888',
  commands: 'CC<=50 【目星】',
  createdAt: now,
  updatedAt: now,
  ...overrides,
});

export const seed = (path: string, data: Record<string, unknown>): SeedDocument => ({ path, data });
export const seedUser = (uid = 'user_1', overrides: Record<string, unknown> = {}): SeedDocument =>
  seed(`users/${uid}`, userDoc({ id: uid, ...overrides }));
export const seedAnalysis = (
  analysisId: string,
  ownerUid = 'user_1',
  overrides: Record<string, unknown> = {},
): SeedDocument => seed(`analyses/${analysisId}`, analysisDoc(analysisId, ownerUid, overrides));
export const seedCharacter = (
  characterId: string,
  uid = 'user_1',
  overrides: Record<string, unknown> = {},
): SeedDocument => seed(`users/${uid}/ccfoliaCharacters/${characterId}`, ccfoliaCharacterDoc(characterId, overrides));

export const saveAnalysisWithCountSync = async (
  db: TestFirestore,
  uid: string,
  analysisId: string,
  overrides: Record<string, unknown> = {},
) => {
  const batch = writeBatch(db);
  batch.set(doc(db, `analyses/${analysisId}`), analysisDoc(analysisId, uid, overrides));
  batch.set(
    doc(db, `users/${uid}`),
    {
      analysisCount: increment(1),
      analysisCountSyncAnalysisId: analysisId,
      updatedAt: Timestamp.fromDate(new Date('2026-03-18T03:00:00.000Z')),
    },
    { merge: true },
  );
  await batch.commit();
};

export const deleteAnalysisWithCountSync = async (db: TestFirestore, uid: string, analysisId: string) => {
  const batch = writeBatch(db);
  batch.delete(doc(db, `analyses/${analysisId}`));
  batch.set(
    doc(db, `users/${uid}`),
    {
      analysisCount: increment(-1),
      analysisCountSyncAnalysisId: analysisId,
      updatedAt: Timestamp.fromDate(new Date('2026-03-18T03:10:00.000Z')),
    },
    { merge: true },
  );
  await batch.commit();
};

export const saveCcfoliaCharacterWithCountSync = async (
  db: TestFirestore,
  uid: string,
  characterId: string,
  overrides: Record<string, unknown> = {},
) => {
  const batch = writeBatch(db);
  batch.set(doc(db, `users/${uid}/ccfoliaCharacters/${characterId}`), {
    ...ccfoliaCharacterDoc(characterId, overrides),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(
    doc(db, `users/${uid}`),
    {
      ccfoliaCharacterCount: increment(1),
      ccfoliaCharacterCountSyncCharacterId: characterId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  await batch.commit();
};

export const deleteCcfoliaCharacterWithCountSync = async (db: TestFirestore, uid: string, characterId: string) => {
  const batch = writeBatch(db);
  batch.delete(doc(db, `users/${uid}/ccfoliaCharacters/${characterId}`));
  batch.set(
    doc(db, `users/${uid}`),
    {
      ccfoliaCharacterCount: increment(-1),
      ccfoliaCharacterCountSyncCharacterId: characterId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  await batch.commit();
};
