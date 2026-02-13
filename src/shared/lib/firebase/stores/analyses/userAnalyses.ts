import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { atom, useAtomValue } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { atomFamily } from 'jotai-family';
import * as v from 'valibot';
import { useFirebase } from '@/shared/lib/firebase/useFirebase';
import { authUserAtom } from '@/shared/lib/firebase/useFirebaseAuth';
import { type AnalysisDocument, analysesStoreSchema, COLLECTIONS } from '../collections';
import { internalUserFamilyAtom } from '../userStore';

type AnalysesAtom = {
  analyses: AnalysisDocument[];
  loading: boolean;
};

const internalUserAnalysesAtomFamily = atomFamily((uid: string | null | undefined) =>
  withAtomEffect(atom<AnalysesAtom>({ analyses: [], loading: true }), (_, set) => {
    const { firestore } = useFirebase();

    if (!uid) {
      set(internalUserAnalysesAtomFamily(uid), { analyses: [], loading: false });
      return;
    }

    const analysesQuery = query(collection(firestore, COLLECTIONS.analyses), where('ownerUid', '==', uid));

    return onSnapshot(analysesQuery, (snapshot) => {
      const data = snapshot.docs.map((docSnap) =>
        v.parse(analysesStoreSchema, docSnap.data({ serverTimestamps: 'estimate' })),
      );
      set(internalUserAnalysesAtomFamily(uid), { analyses: data, loading: false });
      for (const analysis of data) {
        set(internalUserFamilyAtom(analysis.ownerUid), analysis.owner);
      }
    });
  }),
);

export const userAnalysesAtomFamily = atomFamily((uid: string | null | undefined) =>
  atom((get) => get(internalUserAnalysesAtomFamily(uid))),
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

export const useMyAnalyses = () => {
  const analyses = useAtomValue(internalMyAnalysesAtom);
  const loading = useAtomValue(internalMyAnalysesLoadingAtom);

  return { analyses, loading };
};

export const myAnalysesLoadingAtom = atom((get) => get(internalMyAnalysesLoadingAtom));

export const useUserAnalyses = (uid: string | null | undefined) => {
  const { analyses, loading } = useAtomValue(internalUserAnalysesAtomFamily(uid));

  return { analyses, loading };
};
