import { doc, onSnapshot } from 'firebase/firestore';
import { atom } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { atomFamily } from 'jotai-family';

import { getFirebaseFirestore } from '@/shared/lib/firebase/client';
import { FIREBASE_COLLECTIONS } from '@/shared/lib/firebase/collections';

import { type AnalysisDocument, parseAnalysisDocument } from './schema';

type AnalysisAtom = {
  analysis: AnalysisDocument | null;
  loading: boolean;
  error: Error | null;
};

const internalAnalysisAtomFamily = atomFamily((id: string | undefined) =>
  withAtomEffect(atom<AnalysisAtom>({ analysis: null, loading: true, error: null }), (_, set) => {
    const firestore = getFirebaseFirestore();

    if (!id) {
      set(internalAnalysisAtomFamily(id), { analysis: null, loading: false, error: null });
      return;
    }

    const analysisRef = doc(firestore, FIREBASE_COLLECTIONS.analyses, id);
    return onSnapshot(
      analysisRef,
      (snap) => {
        if (!snap.exists()) {
          set(internalAnalysisAtomFamily(id), { analysis: null, loading: false, error: null });
          return;
        }

        const analysisDocument = parseAnalysisDocument(snap.data({ serverTimestamps: 'estimate' }));
        if (!analysisDocument) {
          set(internalAnalysisAtomFamily(id), {
            analysis: null,
            loading: false,
            error: new Error('Invalid analysis document'),
          });
          return;
        }

        set(internalAnalysisAtomFamily(id), { analysis: analysisDocument, loading: false, error: null });
      },
      (err) => {
        const error =
          err.code === 'permission-denied' || err.code === 'not-found' ? null : new Error(err.message, { cause: err });
        set(internalAnalysisAtomFamily(id), { analysis: null, loading: false, error });
      },
    );
  }),
);

export const analysisAtomFamily = atomFamily((id: string | undefined) =>
  atom((get) => get(internalAnalysisAtomFamily(id))),
);
