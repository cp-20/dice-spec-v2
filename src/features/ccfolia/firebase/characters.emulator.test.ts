import { waitFor } from '@testing-library/react';
import { doc, getDocFromServer, Timestamp } from 'firebase/firestore';
import { atom, createStore } from 'jotai';

import {
  CCFOLIA_CHARACTER_PAGE_SIZE,
  createDefaultCcfoliaEditorCharacter,
  toCcfoliaCharacterData,
} from '@/features/ccfolia/model';
import { getFirebaseFirestore } from '@/shared/lib/firebase/client';
import { authUserAtom } from '@/shared/lib/firebase/useFirebaseAuth';
import { setupFirebaseIntegration } from '@/test/firebase';

import { createCcfoliaCharactersQueryAtoms } from './characters';
import {
  createCcfoliaCharacterAtom,
  deleteCcfoliaCharacterAtom,
  CcfoliaCharacterConflictError,
  CcfoliaCharacterNotFoundError,
  updateCcfoliaCharacter,
} from './mutations';

const firebase = setupFirebaseIntegration();
const createdAt = Timestamp.fromMillis(1_000);
const characterData = toCcfoliaCharacterData({ ...createDefaultCcfoliaEditorCharacter(), name: '更新前' });
const characterDocument = (id: string, updatedAt = Timestamp.fromMillis(2_000)) => ({
  ...characterData,
  id,
  schemaVersion: 1,
  revision: 3,
  createdAt,
  updatedAt,
  clipboardExtensions: { secret: true },
});
const path = (id: string) => `users/${firebase.uid()}/ccfoliaCharacters/${id}`;
const readCharacter = async (id: string) => (await getDocFromServer(doc(getFirebaseFirestore(), path(id)))).data();

beforeEach(async () => {
  await firebase.seed(path('character-1'), characterDocument('character-1'));
});

test('更新を保存・再取得し、作成日時とrevisionを保持して省略フィールドを削除する', async () => {
  const nextData = { ...characterData, name: '更新後' };
  expect(
    await updateCcfoliaCharacter(firebase.uid(), {
      characterId: 'character-1',
      expectedRevision: 3,
      data: nextData,
    }),
  ).toBe(4);

  const saved = await readCharacter('character-1');
  expect(saved).toEqual({
    ...nextData,
    id: 'character-1',
    schemaVersion: 1,
    revision: 4,
    createdAt,
    updatedAt: expect.any(Timestamp),
  });
  expect(saved!.updatedAt.toMillis()).toBeGreaterThan(2_000);
});

test('同じrevisionからの並行更新では一方だけを保存する', async () => {
  const results = await Promise.allSettled(
    ['更新A', '更新B'].map((name) =>
      updateCcfoliaCharacter(firebase.uid(), {
        characterId: 'character-1',
        expectedRevision: 3,
        data: { ...characterData, name },
      }),
    ),
  );
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
  const winner = results.findIndex((result) => result.status === 'fulfilled');
  expect(await readCharacter('character-1')).toMatchObject({ revision: 4, name: ['更新A', '更新B'][winner] });
});

test('古いrevisionでの更新は競合として拒否し、保存済みの内容を保持する', async () => {
  await updateCcfoliaCharacter(firebase.uid(), {
    characterId: 'character-1',
    expectedRevision: 3,
    data: { ...characterData, name: '先行更新' },
  });
  await expect(
    updateCcfoliaCharacter(firebase.uid(), {
      characterId: 'character-1',
      expectedRevision: 3,
      data: { ...characterData, name: '古い更新' },
    }),
  ).rejects.toBeInstanceOf(CcfoliaCharacterConflictError);
  expect(await readCharacter('character-1')).toMatchObject({ revision: 4, name: '先行更新' });
});

test('存在しない文書の更新で新規文書を作らない', async () => {
  await expect(
    updateCcfoliaCharacter(firebase.uid(), {
      characterId: 'missing',
      expectedRevision: 3,
      data: characterData,
    }),
  ).rejects.toBeInstanceOf(CcfoliaCharacterNotFoundError);
  expect(await readCharacter('missing')).toBeUndefined();
});

test('他の利用者の文書はRulesで更新を拒否する', async () => {
  const otherPath = 'users/other-user/ccfoliaCharacters/character-1';
  await firebase.seed(otherPath, characterDocument('character-1'));
  await expect(
    updateCcfoliaCharacter('other-user', {
      characterId: 'character-1',
      expectedRevision: 3,
      data: characterData,
    }),
  ).rejects.toMatchObject({ code: 'permission-denied' });
});

test('一覧のソート・追加ページ取得・更新の購読を実データで検証する', async () => {
  const ids = Array.from({ length: CCFOLIA_CHARACTER_PAGE_SIZE }, (_, index) => `page-${index}`);
  await Promise.all(
    ids.map((id, index) => firebase.seed(path(id), characterDocument(id, Timestamp.fromMillis(3_000 + index)))),
  );
  const query = createCcfoliaCharactersQueryAtoms(atom({ uid: firebase.uid() }));
  const store = createStore();
  const unsubscribe = store.sub(query.charactersAtom, () => undefined);
  try {
    await waitFor(() =>
      expect(store.get(query.charactersAtom).characters.map(({ id }) => id)).toEqual([...ids].reverse()),
    );
    expect(store.get(query.charactersAtom).hasMore).toBe(true);
    await store.set(query.loadMoreAtom);
    expect(store.get(query.charactersAtom).characters.map(({ id }) => id)).toEqual(
      [...ids].reverse().concat('character-1'),
    );
    expect(store.get(query.charactersAtom).hasMore).toBe(false);

    await updateCcfoliaCharacter(firebase.uid(), {
      characterId: 'character-1',
      expectedRevision: 3,
      data: { ...characterData, name: '最新' },
    });
    await waitFor(() =>
      expect(store.get(query.charactersAtom).characters[0]).toMatchObject({
        id: 'character-1',
        name: '最新',
        revision: 4,
      }),
    );
    expect(store.get(query.charactersAtom).characters).toHaveLength(CCFOLIA_CHARACTER_PAGE_SIZE);
  } finally {
    unsubscribe();
  }
});

test('追加ページの不正な保存データはエラーにし、読込中のままにしない', async () => {
  await firebase.seed(path('broken'), { schemaVersion: 999, updatedAt: Timestamp.fromMillis(0) });
  await Promise.all(
    Array.from({ length: CCFOLIA_CHARACTER_PAGE_SIZE - 1 }, (_, index) => {
      const id = `page-${index}`;
      return firebase.seed(path(id), characterDocument(id));
    }),
  );
  const query = createCcfoliaCharactersQueryAtoms(atom({ uid: firebase.uid() }));
  const store = createStore();
  const unsubscribe = store.sub(query.charactersAtom, () => undefined);
  try {
    await waitFor(() => expect(store.get(query.charactersAtom).characters).toHaveLength(CCFOLIA_CHARACTER_PAGE_SIZE));
    await store.set(query.loadMoreAtom);
    expect(store.get(query.charactersAtom)).toMatchObject({ loadingMore: false, error: expect.any(Error) });
    expect(store.get(query.charactersAtom).characters).toHaveLength(CCFOLIA_CHARACTER_PAGE_SIZE);
  } finally {
    unsubscribe();
  }
});

test('認証状態から新規保存・削除を実行し、文書と保存件数を一緒に更新する', async () => {
  await firebase.seed(`users/${firebase.uid()}`, {
    id: firebase.uid(),
    name: '利用者',
    plan: 'free',
    createdAt,
    updatedAt: createdAt,
    stripeCustomerId: '',
    stripeSubscriptionId: '',
    ccfoliaCharacterCount: 1,
    ccfoliaCharacterCountSyncCharacterId: null,
  });
  const store = createStore();
  const unsubscribe = store.sub(authUserAtom, () => undefined);
  const readCount = async () =>
    (await getDocFromServer(doc(getFirebaseFirestore(), `users/${firebase.uid()}`))).data()?.ccfoliaCharacterCount;
  try {
    await waitFor(() => expect(store.get(authUserAtom)?.uid).toBe(firebase.uid()));
    const characterId = await store.set(createCcfoliaCharacterAtom, characterData);
    expect(await readCharacter(characterId)).toMatchObject({ ...characterData, id: characterId, revision: 1 });
    expect(await readCount()).toBe(2);
    await store.set(deleteCcfoliaCharacterAtom, { characterId, expectedRevision: 1 });
    expect(await readCharacter(characterId)).toBeUndefined();
    expect(await readCount()).toBe(1);
  } finally {
    unsubscribe();
  }
});
