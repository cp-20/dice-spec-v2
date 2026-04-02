import { doc, onSnapshot } from 'firebase/firestore';
import { atom, useAtomValue } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { atomFamily } from 'jotai-family';
import * as v from 'valibot';
import { useFirebase } from '@/shared/lib/firebase/useFirebase';
import { type AnalysisDocument, analysesStoreSchema, COLLECTIONS } from '../collections';
import { internalUserFamilyAtom } from '../userStore';

type AnalysisAtom = {
  analysis: AnalysisDocument | null;
  loading: boolean;
};

const internalAnalysisAtomFamily = atomFamily((id: string | undefined) =>
  withAtomEffect(atom<AnalysisAtom>({ analysis: null, loading: true }), (_, set) => {
    const { firestore } = useFirebase();

    if (!id) {
      set(internalAnalysisAtomFamily(id), { analysis: null, loading: false });
      return;
    }

    const analysisRef = doc(firestore, COLLECTIONS.analyses, id);
    return onSnapshot(
      analysisRef,
      (snap) => {
        if (!snap.exists()) {
          set(internalAnalysisAtomFamily(id), { analysis: null, loading: false });
          return;
        }

        const analysisDocument = v.parse(analysesStoreSchema, snap.data({ serverTimestamps: 'estimate' }));
        set(internalAnalysisAtomFamily(id), { analysis: analysisDocument, loading: false });
        set(internalUserFamilyAtom(analysisDocument.ownerUid), analysisDocument.owner);
      },
      (err) => {
        if (err.code === 'permission-denied' || err.code === 'not-found') {
          set(internalAnalysisAtomFamily(id), { analysis: null, loading: false });
        } else {
          throw err;
        }
      },
    );
  }),
);

export const analysisAtomFamily = atomFamily((id: string | undefined) =>
  atom((get) => get(internalAnalysisAtomFamily(id))),
);

export const useAnalysisById = (id: string | undefined) => {
  const { analysis, loading } = useAtomValue(internalAnalysisAtomFamily(id));

  return { analysis, loading };
};
