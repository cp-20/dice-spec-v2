import { doc, onSnapshot } from 'firebase/firestore';
import { atom, useAtomValue } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { atomFamily } from 'jotai-family';
import * as v from 'valibot';
import { downloadAnalysisRecordsFromStorage } from '@/shared/lib/firebase/storage/analysisRecords';
import { useFirebase } from '../useFirebase';
import { authUserAtom } from '../useFirebaseAuth';
import { type AnalysisRecordsDocument, analysesStoreSchema, COLLECTIONS } from './collections';

type AnalysisRecordsAtom = {
  records: AnalysisRecordsDocument | null;
  loading: boolean;
};

const internalAnalysisRecordsAtomFamily = atomFamily((id: string | undefined) =>
  withAtomEffect(atom<AnalysisRecordsAtom>({ records: null, loading: true }), (get, set) => {
    const { firestore, storage } = useFirebase();
    const authUser = get(authUserAtom);

    if (!id) {
      set(internalAnalysisRecordsAtomFamily(id), { records: null, loading: false });
      return;
    }

    const analysisRef = doc(firestore, COLLECTIONS.analyses, id);

    // 最新の結果のみを反映するために、onSnapshot のシーケンスを管理する
    let sequence = 0;

    return onSnapshot(
      analysisRef,
      async (snap) => {
        const currentSequence = ++sequence;

        if (!snap.exists()) {
          set(internalAnalysisRecordsAtomFamily(id), { records: null, loading: false });
          return;
        }

        const analysis = v.parse(analysesStoreSchema, snap.data({ serverTimestamps: 'estimate' }));
        const isOwner = authUser !== null && authUser.uid === analysis.ownerUid;

        const canViewRecords = (analysis.visibilityLevel !== 'private' && analysis.showRecordDetails) || isOwner;
        if (!canViewRecords) {
          set(internalAnalysisRecordsAtomFamily(id), { records: null, loading: false });
          return;
        }

        set(internalAnalysisRecordsAtomFamily(id), (prev) => ({ ...prev, loading: true }));
        const recordsDocument = await downloadAnalysisRecordsFromStorage(storage, analysis.ownerUid, analysis.id);

        if (currentSequence !== sequence) return;
        set(internalAnalysisRecordsAtomFamily(id), { records: recordsDocument, loading: false });
      },
      (err) => {
        if (err.code === 'permission-denied' || err.code === 'not-found') {
          set(internalAnalysisRecordsAtomFamily(id), { records: null, loading: false });
        } else {
          throw err;
        }
      },
    );
  }),
);

export const analysisRecordsAtomFamily = atomFamily((id: string | undefined) =>
  atom((get) => get(internalAnalysisRecordsAtomFamily(id))),
);

export const useAnalysisRecordsById = (id: string | undefined) => {
  const { records, loading } = useAtomValue(internalAnalysisRecordsAtomFamily(id));

  return { records, loading };
};

// 保存・削除は analyses ドキュメントと同時に行う必要があるため、analysesStore 内で記述する
