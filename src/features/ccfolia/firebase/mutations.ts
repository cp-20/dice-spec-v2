import { FirebaseError } from 'firebase/app';
import {
  collection,
  doc,
  getDocFromServer,
  increment,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { atom } from 'jotai';

import {
  CCFOLIA_CHARACTER_SCHEMA_VERSION,
  CCFOLIA_CHARACTER_SAVE_LIMIT_FREE,
  type CcfoliaCharacterData,
  type NewCcfoliaCharacterDocument,
  parseCcfoliaCharacterDocument,
} from '@/features/ccfolia/model';
import { getFirebaseFirestore } from '@/shared/lib/firebase/client';
import { FIREBASE_COLLECTIONS } from '@/shared/lib/firebase/collections';
import { authUserAtom } from '@/shared/lib/firebase/useFirebaseAuth';

export class CcfoliaCharacterConflictError extends Error {
  constructor() {
    super('The CCFOLIA character was updated in another session');
    this.name = 'CcfoliaCharacterConflictError';
  }
}

export class CcfoliaCharacterNotFoundError extends Error {
  constructor() {
    super('The CCFOLIA character no longer exists');
    this.name = 'CcfoliaCharacterNotFoundError';
  }
}

export class CcfoliaCharacterLimitError extends Error {
  constructor() {
    super('The free CCFOLIA character save limit was reached');
    this.name = 'CcfoliaCharacterLimitError';
  }
}

export const createCcfoliaCharacterAtom = atom(null, async (get, _set, data: CcfoliaCharacterData) => {
  const authUser = get(authUserAtom);
  if (!authUser) throw new Error('Sign-in is required to save a CCFOLIA character');

  const firestore = getFirebaseFirestore();
  const characterRef = doc(
    collection(firestore, FIREBASE_COLLECTIONS.users, authUser.uid, FIREBASE_COLLECTIONS.ccfoliaCharacters),
  );
  const userRef = doc(firestore, FIREBASE_COLLECTIONS.users, authUser.uid);
  const document: NewCcfoliaCharacterDocument = {
    ...data,
    id: characterRef.id,
    schemaVersion: CCFOLIA_CHARACTER_SCHEMA_VERSION,
    revision: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const batch = writeBatch(firestore);
  batch.set(characterRef, document);
  batch.update(userRef, {
    ccfoliaCharacterCount: increment(1),
    ccfoliaCharacterCountSyncCharacterId: characterRef.id,
    updatedAt: serverTimestamp(),
  });
  try {
    await batch.commit();
  } catch (error) {
    // 別タブが最後の無料枠を先に使った場合は、権限エラーではなく保存上限として表示する。
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      try {
        const latestUser = await getDocFromServer(userRef);
        const latestData = latestUser.data();
        if (
          latestData?.plan !== 'pro' &&
          typeof latestData?.ccfoliaCharacterCount === 'number' &&
          latestData.ccfoliaCharacterCount >= CCFOLIA_CHARACTER_SAVE_LIMIT_FREE
        ) {
          throw new CcfoliaCharacterLimitError();
        }
      } catch (refreshError) {
        if (refreshError instanceof CcfoliaCharacterLimitError) throw refreshError;
      }
    }
    throw error;
  }
  return characterRef.id;
});

type UpdateCcfoliaCharacter = {
  characterId: string;
  expectedRevision: number;
  data: CcfoliaCharacterData;
};

export const updateCcfoliaCharacter = async (
  uid: string,
  { characterId, expectedRevision, data }: UpdateCcfoliaCharacter,
): Promise<number> => {
  const firestore = getFirebaseFirestore();
  const characterRef = doc(
    firestore,
    FIREBASE_COLLECTIONS.users,
    uid,
    FIREBASE_COLLECTIONS.ccfoliaCharacters,
    characterId,
  );
  return await runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(characterRef);
    if (!snapshot.exists()) throw new CcfoliaCharacterNotFoundError();

    const current = parseCcfoliaCharacterDocument(snapshot.data());
    if (current.revision !== expectedRevision) throw new CcfoliaCharacterConflictError();

    const nextRevision = expectedRevision + 1;
    transaction.set(characterRef, {
      ...data,
      id: characterId,
      schemaVersion: CCFOLIA_CHARACTER_SCHEMA_VERSION,
      revision: nextRevision,
      createdAt: current.createdAt,
      updatedAt: serverTimestamp(),
    });
    return nextRevision;
  });
};

export const updateCcfoliaCharacterAtom = atom(
  null,
  async (get, _set, input: UpdateCcfoliaCharacter): Promise<number> => {
    const authUser = get(authUserAtom);
    if (!authUser) throw new Error('Sign-in is required to update a CCFOLIA character');
    return await updateCcfoliaCharacter(authUser.uid, input);
  },
);

type DeleteCcfoliaCharacter = {
  characterId: string;
  expectedRevision: number;
};

export const deleteCcfoliaCharacterAtom = atom(
  null,
  async (get, _set, { characterId, expectedRevision }: DeleteCcfoliaCharacter): Promise<void> => {
    const authUser = get(authUserAtom);
    if (!authUser) throw new Error('Sign-in is required to delete a CCFOLIA character');

    const firestore = getFirebaseFirestore();
    const characterRef = doc(
      firestore,
      FIREBASE_COLLECTIONS.users,
      authUser.uid,
      FIREBASE_COLLECTIONS.ccfoliaCharacters,
      characterId,
    );
    const userRef = doc(firestore, FIREBASE_COLLECTIONS.users, authUser.uid);
    await runTransaction(firestore, async (transaction) => {
      const snapshot = await transaction.get(characterRef);
      if (!snapshot.exists()) throw new CcfoliaCharacterNotFoundError();

      const current = parseCcfoliaCharacterDocument(snapshot.data());
      if (current.revision !== expectedRevision) throw new CcfoliaCharacterConflictError();

      transaction.delete(characterRef);
      transaction.update(userRef, {
        ccfoliaCharacterCount: increment(-1),
        ccfoliaCharacterCountSyncCharacterId: characterId,
        updatedAt: serverTimestamp(),
      });
    });
  },
);
