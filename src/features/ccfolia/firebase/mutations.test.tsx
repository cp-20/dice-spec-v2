import { beforeEach, expect, mock, test, vi } from 'bun:test';

import * as firestore from 'firebase/firestore';

import { createDefaultCcfoliaEditorCharacter, toCcfoliaCharacterData } from '@/features/ccfolia/model';

const updatedAt = { type: 'server-timestamp' };
const transactionSet = vi.fn();
const transactionUpdate = vi.fn();
const createdAt = firestore.Timestamp.fromMillis(1_000);
const currentData = {
  ...toCcfoliaCharacterData({ ...createDefaultCcfoliaEditorCharacter(), name: '更新前' }),
  clipboardExtensions: { secret: true },
  id: 'character-1',
  schemaVersion: 1,
  revision: 3,
  createdAt,
  updatedAt: firestore.Timestamp.fromMillis(2_000),
};
let transactionData = currentData;

mock.module('firebase/firestore', () => ({
  ...firestore,
  doc: vi.fn(() => ({})),
  runTransaction: vi.fn(async (_database: unknown, updateFunction: (transaction: unknown) => Promise<unknown>) =>
    updateFunction({
      get: vi.fn(async () => ({ exists: () => true, data: () => transactionData })),
      set: transactionSet,
      update: transactionUpdate,
      delete: vi.fn(),
    }),
  ),
  serverTimestamp: vi.fn(() => updatedAt),
}));
mock.module('@/shared/lib/firebase/client', () => ({
  getFirebaseAuth: () => ({}),
  getFirebaseFirestore: () => ({}),
}));

beforeEach(() => {
  transactionData = currentData;
  transactionSet.mockClear();
  transactionUpdate.mockClear();
});

test('更新では作成日時を保持した全置換を行い、省略した任意フィールドを残さない', async () => {
  const { updateCcfoliaCharacter } = await import('./mutations');
  const nextData = toCcfoliaCharacterData({ ...createDefaultCcfoliaEditorCharacter(), name: '更新後' });

  expect(
    await updateCcfoliaCharacter('user-1', {
      characterId: 'character-1',
      expectedRevision: 3,
      data: nextData,
    }),
  ).toBe(4);

  expect(transactionSet).toHaveBeenCalledTimes(1);
  expect(transactionUpdate).not.toHaveBeenCalled();
  expect(transactionSet.mock.calls[0]?.[1]).toEqual({
    ...nextData,
    id: 'character-1',
    schemaVersion: 1,
    revision: 4,
    createdAt,
    updatedAt,
  });
  expect(transactionSet.mock.calls[0]?.[1]).not.toHaveProperty('clipboardExtensions');
});
