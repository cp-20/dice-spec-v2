import { doc, onSnapshot } from 'firebase/firestore';
import { atom } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { atomFamily } from 'jotai-family';

import { useFirebase } from '@/shared/lib/firebase/useFirebase';

import { type AnalysisDocument, COLLECTIONS, parseAnalysisDocument } from '../collections';
import { internalUserFamilyAtom } from '../userAtoms';

type AnalysisAtom = {
  analysis: AnalysisDocument | null;
  loading: boolean;
  error: Error | null;
};

const internalAnalysisAtomFamily = atomFamily((id: string | undefined) =>
  withAtomEffect(atom<AnalysisAtom>({ analysis: null, loading: true, error: null }), (_, set) => {
    const { firestore } = useFirebase();

    if (!id) {
      set(internalAnalysisAtomFamily(id), { analysis: null, loading: false, error: null });
      return;
    }

    const analysisRef = doc(firestore, COLLECTIONS.analyses, id);
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
        set(internalUserFamilyAtom(analysisDocument.ownerUid), analysisDocument.owner);
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
