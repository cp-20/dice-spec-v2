import { beforeEach, expect, mock, test, vi } from 'bun:test';

import { waitFor } from '@testing-library/react';
import * as firestore from 'firebase/firestore';
import { atom, createStore } from 'jotai';

import { CCFOLIA_CHARACTER_PAGE_SIZE } from '@/features/ccfolia/model';

type TestSnapshot = {
  docs: TestDocument[];
  size: number;
};

type TestDocument = {
  id: string;
  data: () => Record<string, unknown>;
};

let snapshotNext: ((snapshot: TestSnapshot) => void) | undefined;
let snapshotError: ((error: Error) => void) | undefined;
let resolveNextPage: ((snapshot: TestSnapshot) => void) | undefined;

const getDocsMock = vi.fn(
  () =>
    new Promise<TestSnapshot>((resolve) => {
      resolveNextPage = resolve;
    }),
);

mock.module('firebase/firestore', () => ({
  ...firestore,
  collection: vi.fn(() => ({})),
  getDocs: getDocsMock,
  limit: vi.fn((value: number) => ({ limit: value })),
  onSnapshot: vi.fn((_query: unknown, next: typeof snapshotNext, error: typeof snapshotError) => {
    snapshotNext = next;
    snapshotError = error;
    return vi.fn();
  }),
  orderBy: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  startAfter: vi.fn(() => ({})),
}));

mock.module('@/shared/lib/firebase/client', () => ({
  getFirebaseAuth: () => ({}),
  getFirebaseFirestore: () => ({}),
}));
mock.module('@/shared/lib/sentryClient', () => ({ captureClientException: vi.fn() }));

const makeDocument = (id: string): TestDocument => {
  const timestamp = firestore.Timestamp.fromMillis(0);
  return {
    id,
    data: () => ({
      id,
      schemaVersion: 1,
      revision: 1,
      name: id,
      memo: '',
      initiative: null,
      externalUrl: '',
      status: [],
      params: [],
      color: '#888888',
      commands: '',
      createdAt: timestamp,
      updatedAt: timestamp,
    }),
  };
};

beforeEach(() => {
  snapshotNext = undefined;
  snapshotError = undefined;
  resolveNextPage = undefined;
  getDocsMock.mockClear();
});

test('先頭ページ購読のエラー後に遅延した追加取得で不完全な一覧へ戻さない', async () => {
  const { createCcfoliaCharactersQueryAtoms } = await import('./characters');
  const queryAtoms = createCcfoliaCharactersQueryAtoms(atom({ uid: 'user-1' }));
  const store = createStore();
  const unsubscribe = store.sub(queryAtoms.charactersAtom, () => undefined);

  await waitFor(() => expect(snapshotNext).toBeDefined());

  const documents = Array.from({ length: CCFOLIA_CHARACTER_PAGE_SIZE }, (_, index) =>
    makeDocument(`character-${index}`),
  );
  snapshotNext!({ docs: documents, size: documents.length });
  expect(store.get(queryAtoms.charactersAtom).hasMore).toBe(true);

  const loadMorePromise = store.set(queryAtoms.loadMoreAtom);
  expect(store.get(queryAtoms.charactersAtom).loadingMore).toBe(true);

  snapshotError!(new Error('permission denied'));
  expect(store.get(queryAtoms.charactersAtom).error?.message).toBe('permission denied');
  expect(store.get(queryAtoms.charactersAtom).characters).toHaveLength(0);

  const nextDocuments = [makeDocument(`character-${CCFOLIA_CHARACTER_PAGE_SIZE}`)];
  resolveNextPage!({ docs: nextDocuments, size: nextDocuments.length });
  await loadMorePromise;

  expect(store.get(queryAtoms.charactersAtom).error?.message).toBe('permission denied');
  expect(store.get(queryAtoms.charactersAtom).characters).toHaveLength(0);
  expect(store.get(queryAtoms.charactersAtom).loadingMore).toBe(false);
  unsubscribe();
});

test('追加ページに不正な保存データがある場合は読込中のままにしない', async () => {
  const { createCcfoliaCharactersQueryAtoms } = await import('./characters');
  const queryAtoms = createCcfoliaCharactersQueryAtoms(atom({ uid: 'user-1' }));
  const store = createStore();
  const unsubscribe = store.sub(queryAtoms.charactersAtom, () => undefined);

  await waitFor(() => expect(snapshotNext).toBeDefined());

  const documents = Array.from({ length: CCFOLIA_CHARACTER_PAGE_SIZE }, (_, index) =>
    makeDocument(`character-${index}`),
  );
  snapshotNext!({ docs: documents, size: documents.length });

  const loadMorePromise = store.set(queryAtoms.loadMoreAtom);
  resolveNextPage!({
    docs: [{ ...makeDocument('broken'), data: () => ({ schemaVersion: 999 }) }],
    size: 1,
  });
  await loadMorePromise;

  expect(store.get(queryAtoms.charactersAtom).characters).toHaveLength(CCFOLIA_CHARACTER_PAGE_SIZE);
  expect(store.get(queryAtoms.charactersAtom).loadingMore).toBe(false);
  expect(store.get(queryAtoms.charactersAtom).error).toBeInstanceOf(Error);
  unsubscribe();
});
