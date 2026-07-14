import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { atom, useAtomValue } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { atomFamily } from 'jotai-family';

import { getFirebaseServices } from '@/shared/lib/firebase/client';
import { authUserAtom } from '@/shared/lib/firebase/useFirebaseAuth';
import { FIREBASE_COLLECTIONS } from '@/shared/lib/firebase/collections';

import { type AnalysisDocument, parseAnalysisDocument } from './schema';

type AnalysesAtom = {
  analyses: AnalysisDocument[];
  loading: boolean;
  error: Error | null;
};

const internalUserAnalysesAtomFamily = atomFamily((uid: string | null | undefined) =>
  withAtomEffect(atom<AnalysesAtom>({ analyses: [], loading: true, error: null }), (_, set) => {
    const { firestore } = getFirebaseServices();

    if (!uid) {
      set(internalUserAnalysesAtomFamily(uid), { analyses: [], loading: false, error: null });
      return;
    }

    const analysesQuery = query(collection(firestore, FIREBASE_COLLECTIONS.analyses), where('ownerUid', '==', uid));

    return onSnapshot(
      analysesQuery,
      (snapshot) => {
        let hasInvalidDocument = false;
        const data = snapshot.docs.flatMap((docSnap) => {
          const parsed = parseAnalysisDocument(docSnap.data({ serverTimestamps: 'estimate' }));
          if (parsed) return [parsed];
          hasInvalidDocument = true;
          return [];
        });
        set(internalUserAnalysesAtomFamily(uid), {
          analyses: data,
          loading: false,
          error: hasInvalidDocument ? new Error('Invalid analysis document') : null,
        });
      },
      (error) => {
        set(internalUserAnalysesAtomFamily(uid), {
          analyses: [],
          loading: false,
          error: new Error(error.message, { cause: error }),
        });
      },
    );
  }),
);

const internalMyAnalysesAtom = atom((get) => {
  const authUser = get(authUserAtom);
  const { analyses } = get(internalUserAnalysesAtomFamily(authUser?.uid));
  return analyses;
});

export const myAnalysesAtom = atom((get) => get(internalMyAnalysesAtom));

const internalMyAnalysesLoadingAtom = atom((get) => {
  const authUser = get(authUserAtom);
  const { loading } = get(internalUserAnalysesAtomFamily(authUser?.uid));
  return loading;
});

export const myAnalysesLoadingAtom = atom((get) => get(internalMyAnalysesLoadingAtom));

export const useUserAnalyses = (uid: string | null | undefined) => {
  const { analyses, loading, error } = useAtomValue(internalUserAnalysesAtomFamily(uid));

  return { analyses, loading, error };
};
