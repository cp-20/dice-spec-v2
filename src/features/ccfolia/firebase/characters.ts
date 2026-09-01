import {
  collection,
  doc,
  type DocumentData,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  type QueryDocumentSnapshot,
  startAfter,
} from 'firebase/firestore';
import { atom, type Atom } from 'jotai';
import { withAtomEffect } from 'jotai-effect';

import {
  CCFOLIA_CHARACTER_PAGE_SIZE,
  type CcfoliaCharacterDocument,
  parseCcfoliaCharacterDocument,
} from '@/features/ccfolia/model';
import { getFirebaseFirestore } from '@/shared/lib/firebase/client';
import { FIREBASE_COLLECTIONS } from '@/shared/lib/firebase/collections';
import { captureClientException } from '@/shared/lib/sentryClient';

type AuthUserAtom = Atom<{ uid: string } | null | undefined>;

export type CcfoliaCharactersQueryState = {
  characters: CcfoliaCharacterDocument[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
};

type InternalCcfoliaCharactersQueryState = CcfoliaCharactersQueryState & {
  ownerUid: string | null;
};

const initialCharactersQueryState: InternalCcfoliaCharactersQueryState = {
  ownerUid: null,
  characters: [],
  loading: true,
  loadingMore: false,
  hasMore: false,
  error: null,
};

const parseDocuments = (documents: QueryDocumentSnapshot<DocumentData>[]) =>
  documents.map((document) => {
    const character = parseCcfoliaCharacterDocument(document.data({ serverTimestamps: 'estimate' }));
    if (character.id !== document.id) throw new Error('CCFOLIA character document ID does not match its path');
    return character;
  });

export const createCcfoliaCharactersQueryAtoms = (authUserAtom: AuthUserAtom) => {
  const queryStateAtom = atom<InternalCcfoliaCharactersQueryState>(initialCharactersQueryState);
  const cursorAtom = atom<QueryDocumentSnapshot<DocumentData> | null>(null);
  const generationAtom = atom(0);

  const queryStateWithSubscriptionAtom = withAtomEffect(queryStateAtom, (get, set) => {
    const uid = get(authUserAtom)?.uid;
    set(generationAtom, (current) => current + 1);
    set(cursorAtom, null);
    if (!uid) {
      set(queryStateAtom, { ...initialCharactersQueryState, loading: false });
      return;
    }

    const subscriptionUid = uid;
    let active = true;
    set(queryStateAtom, { ...initialCharactersQueryState, ownerUid: subscriptionUid });
    const charactersQuery = query(
      collection(
        getFirebaseFirestore(),
        FIREBASE_COLLECTIONS.users,
        subscriptionUid,
        FIREBASE_COLLECTIONS.ccfoliaCharacters,
      ),
      orderBy('updatedAt', 'desc'),
      limit(CCFOLIA_CHARACTER_PAGE_SIZE),
    );

    const fail = (error: unknown) => {
      if (!active) return;
      set(generationAtom, (current) => current + 1);
      set(cursorAtom, null);
      const loadError = error instanceof Error ? error : new Error('Failed to load CCFOLIA characters');
      captureClientException(loadError);
      set(queryStateAtom, {
        ...initialCharactersQueryState,
        ownerUid: subscriptionUid,
        loading: false,
        error: loadError,
      });
    };

    const unsubscribe = onSnapshot(
      charactersQuery,
      (snapshot) => {
        if (!active) return;
        try {
          // 先頭ページの変更で後続ページのカーソルも変わるため、追加読込済みのページは破棄する。
          set(generationAtom, (current) => current + 1);
          const characters = parseDocuments(snapshot.docs);
          set(cursorAtom, snapshot.docs.at(-1) ?? null);
          set(queryStateAtom, {
            ownerUid: subscriptionUid,
            characters,
            loading: false,
            loadingMore: false,
            hasMore: snapshot.size === CCFOLIA_CHARACTER_PAGE_SIZE,
            error: null,
          });
        } catch (error) {
          fail(error);
        }
      },
      fail,
    );

    return () => {
      active = false;
      set(generationAtom, (current) => current + 1);
      set(cursorAtom, null);
      set(queryStateAtom, initialCharactersQueryState);
      unsubscribe();
    };
  });

  const loadMoreAtom = atom(null, async (get, set) => {
    const uid = get(authUserAtom)?.uid;
    const cursor = get(cursorAtom);
    const state = get(queryStateAtom);
    if (!uid || !cursor || state.loadingMore || !state.hasMore) return;
    const generation = get(generationAtom);

    set(queryStateAtom, (current) => ({ ...current, loadingMore: true }));
    try {
      const nextPage = await getDocs(
        query(
          collection(getFirebaseFirestore(), FIREBASE_COLLECTIONS.users, uid, FIREBASE_COLLECTIONS.ccfoliaCharacters),
          orderBy('updatedAt', 'desc'),
          startAfter(cursor),
          limit(CCFOLIA_CHARACTER_PAGE_SIZE),
        ),
      );
      if (get(generationAtom) !== generation) return;

      const parsedCharacters = parseDocuments(nextPage.docs);
      set(cursorAtom, nextPage.docs.at(-1) ?? cursor);
      set(queryStateAtom, (current) => {
        const characters = new Map(current.characters.map((character) => [character.id, character]));
        for (const character of parsedCharacters) characters.set(character.id, character);
        return {
          ownerUid: uid,
          characters: [...characters.values()],
          loading: false,
          loadingMore: false,
          hasMore: nextPage.size === CCFOLIA_CHARACTER_PAGE_SIZE,
          error: null,
        };
      });
    } catch (error) {
      if (get(generationAtom) !== generation) return;
      const loadError = error instanceof Error ? error : new Error('Failed to load more CCFOLIA characters');
      captureClientException(loadError);
      set(queryStateAtom, (current) => ({ ...current, loadingMore: false, error: loadError }));
    }
  });

  const charactersAtom = atom((get): CcfoliaCharactersQueryState => {
    const uid = get(authUserAtom)?.uid ?? null;
    const state = get(queryStateWithSubscriptionAtom);
    if (state.ownerUid === uid) return state;
    return { ...initialCharactersQueryState, loading: Boolean(uid) };
  });

  return { charactersAtom, loadMoreAtom };
};

export type CcfoliaCharacterQueryState = {
  ownerUid: string | null;
  characterId: string | null;
  character: CcfoliaCharacterDocument | null;
  exists: boolean | null;
  loading: boolean;
  error: Error | null;
};

const initialCharacterQueryState: CcfoliaCharacterQueryState = {
  ownerUid: null,
  characterId: null,
  character: null,
  exists: null,
  loading: false,
  error: null,
};

export const createCcfoliaCharacterQueryAtom = (authUserAtom: AuthUserAtom, characterIdAtom: Atom<string | null>) => {
  const queryStateAtom = atom<CcfoliaCharacterQueryState>(initialCharacterQueryState);

  const queryStateWithSubscriptionAtom = withAtomEffect(queryStateAtom, (get, set) => {
    const uid = get(authUserAtom)?.uid;
    const characterId = get(characterIdAtom);
    if (!uid || !characterId) {
      set(queryStateAtom, initialCharacterQueryState);
      return;
    }

    const subscriptionUid = uid;
    const subscriptionCharacterId = characterId;
    let active = true;
    set(queryStateAtom, {
      ...initialCharacterQueryState,
      ownerUid: subscriptionUid,
      characterId: subscriptionCharacterId,
      loading: true,
    });

    const characterRef = doc(
      getFirebaseFirestore(),
      FIREBASE_COLLECTIONS.users,
      subscriptionUid,
      FIREBASE_COLLECTIONS.ccfoliaCharacters,
      subscriptionCharacterId,
    );

    const fail = (error: unknown) => {
      if (!active) return;
      const loadError = error instanceof Error ? error : new Error('Failed to load CCFOLIA character');
      captureClientException(loadError);
      set(queryStateAtom, {
        ownerUid: subscriptionUid,
        characterId: subscriptionCharacterId,
        character: null,
        exists: null,
        loading: false,
        error: loadError,
      });
    };

    const unsubscribe = onSnapshot(
      characterRef,
      (snapshot) => {
        if (!active) return;
        if (!snapshot.exists()) {
          set(queryStateAtom, {
            ownerUid: subscriptionUid,
            characterId: subscriptionCharacterId,
            character: null,
            exists: false,
            loading: false,
            error: null,
          });
          return;
        }

        try {
          const character = parseCcfoliaCharacterDocument(snapshot.data({ serverTimestamps: 'estimate' }));
          if (character.id !== subscriptionCharacterId) {
            throw new Error('CCFOLIA character document ID does not match its path');
          }
          set(queryStateAtom, {
            ownerUid: subscriptionUid,
            characterId: subscriptionCharacterId,
            character,
            exists: true,
            loading: false,
            error: null,
          });
        } catch (error) {
          fail(error);
        }
      },
      fail,
    );

    return () => {
      active = false;
      set(queryStateAtom, initialCharacterQueryState);
      unsubscribe();
    };
  });

  return atom((get): CcfoliaCharacterQueryState => {
    const uid = get(authUserAtom)?.uid ?? null;
    const characterId = get(characterIdAtom);
    const state = get(queryStateWithSubscriptionAtom);
    if (state.ownerUid === uid && state.characterId === characterId) return state;
    return { ...initialCharacterQueryState, ownerUid: uid, characterId, loading: Boolean(uid && characterId) };
  });
};
