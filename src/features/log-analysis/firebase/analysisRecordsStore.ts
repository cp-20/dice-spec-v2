import { doc, onSnapshot } from 'firebase/firestore';
import { atom } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { atomFamily } from 'jotai-family';

import { getFirebaseFirestore, getFirebaseStorage } from '@/shared/lib/firebase/client';
import { FIREBASE_COLLECTIONS } from '@/shared/lib/firebase/collections';
import { authUserAtom } from '@/shared/lib/firebase/useFirebaseAuth';

import { downloadAnalysisRecordsFromStorage } from './analysisRecordsStorage';
import { type AnalysisRecordsDocument, parseAnalysisDocument } from './schema';

type AnalysisRecordsAtom = {
  records: AnalysisRecordsDocument | null;
  loading: boolean;
  error: Error | null;
};

const internalAnalysisRecordsAtomFamily = atomFamily((id: string | undefined) =>
  withAtomEffect(atom<AnalysisRecordsAtom>({ records: null, loading: true, error: null }), (get, set) => {
    const firestore = getFirebaseFirestore();
    const storage = getFirebaseStorage();
    const authUser = get(authUserAtom);

    if (!id) {
      set(internalAnalysisRecordsAtomFamily(id), { records: null, loading: false, error: null });
      return;
    }

    const analysisRef = doc(firestore, FIREBASE_COLLECTIONS.analyses, id);

    // 最新の結果のみを反映するために、onSnapshot のシーケンスを管理する
    let sequence = 0;

    return onSnapshot(
      analysisRef,
      async (snap) => {
        const currentSequence = ++sequence;

        if (!snap.exists()) {
          set(internalAnalysisRecordsAtomFamily(id), { records: null, loading: false, error: null });
          return;
        }

        const analysis = parseAnalysisDocument(snap.data({ serverTimestamps: 'estimate' }));
        if (!analysis) {
          set(internalAnalysisRecordsAtomFamily(id), {
            records: null,
            loading: false,
            error: new Error('Invalid analysis document'),
          });
          return;
        }
        const isOwner = authUser !== null && authUser.uid === analysis.ownerUid;

        const canViewRecords = (analysis.visibilityLevel !== 'private' && analysis.showRecordDetails) || isOwner;
        if (!canViewRecords) {
          set(internalAnalysisRecordsAtomFamily(id), { records: null, loading: false, error: null });
          return;
        }

        set(internalAnalysisRecordsAtomFamily(id), (prev) => ({ ...prev, loading: true, error: null }));
        try {
          const recordsDocument = await downloadAnalysisRecordsFromStorage(storage, analysis.ownerUid, analysis.id);
          if (currentSequence !== sequence) return;
          set(internalAnalysisRecordsAtomFamily(id), { records: recordsDocument, loading: false, error: null });
        } catch (error) {
          if (currentSequence !== sequence) return;
          set(internalAnalysisRecordsAtomFamily(id), {
            records: null,
            loading: false,
            error: error instanceof Error ? error : new Error('Failed to load analysis records'),
          });
        }
      },
      (err) => {
        const error =
          err.code === 'permission-denied' || err.code === 'not-found' ? null : new Error(err.message, { cause: err });
        set(internalAnalysisRecordsAtomFamily(id), { records: null, loading: false, error });
      },
    );
  }),
);

export const analysisRecordsAtomFamily = atomFamily((id: string | undefined) =>
  atom((get) => get(internalAnalysisRecordsAtomFamily(id))),
);

// 保存・削除は analyses ドキュメントと同時に行う必要があるため、analysesStore 内で記述する
