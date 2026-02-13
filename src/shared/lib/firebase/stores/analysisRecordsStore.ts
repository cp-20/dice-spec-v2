import { deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { atom, useAtomValue } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { atomFamily } from 'jotai-family';
import { useCallback, useState } from 'react';
import * as v from 'valibot';
import { useFirebase } from '../useFirebase';
import { type AnalysisRecordsDocument, analysisRecordsSchema, COLLECTIONS } from './collections';

type AnalysisRecordsAtom = {
  records: AnalysisRecordsDocument | null;
  loading: boolean;
};

const internalAnalysisRecordsAtomFamily = atomFamily((id: string | undefined) =>
  withAtomEffect(atom<AnalysisRecordsAtom>({ records: null, loading: true }), (_, set) => {
    const { firestore } = useFirebase();

    if (!id) {
      set(internalAnalysisRecordsAtomFamily(id), { records: null, loading: false });
      return;
    }

    const recordsRef = doc(firestore, COLLECTIONS.analysisRecords, id);
    return onSnapshot(recordsRef, (snap) => {
      if (!snap.exists()) {
        set(internalAnalysisRecordsAtomFamily(id), { records: null, loading: false });
        return;
      }

      const recordsDocument = v.parse(analysisRecordsSchema, snap.data({ serverTimestamps: 'estimate' }));
      set(internalAnalysisRecordsAtomFamily(id), { records: recordsDocument, loading: false });
    });
  }),
);

export const analysisRecordsAtomFamily = atomFamily((id: string | undefined) =>
  atom((get) => get(internalAnalysisRecordsAtomFamily(id))),
);

export const useAnalysisRecordsById = (id: string | undefined) => {
  const { records, loading } = useAtomValue(internalAnalysisRecordsAtomFamily(id));

  return { records, loading };
};

export type SaveAnalysisRecordsPayload = AnalysisRecordsDocument;

export const useSaveAnalysisRecords = () => {
  const { firestore } = useFirebase();
  const [saving, setSaving] = useState(false);

  const saveAnalysisRecords = useCallback(
    async (payload: SaveAnalysisRecordsPayload) => {
      setSaving(true);
      try {
        const recordsRef = doc(firestore, COLLECTIONS.analysisRecords, payload.analysisId);

        const recordsData: AnalysisRecordsDocument = payload;
        await setDoc(recordsRef, recordsData);
      } finally {
        setSaving(false);
      }
    },
    [firestore],
  );

  return { saveAnalysisRecords, saving };
};

export const useDeleteAnalysisRecords = () => {
  const { firestore } = useFirebase();

  const deleteAnalysisRecords = useCallback(
    async (analysisId: string) => {
      const recordsRef = doc(firestore, COLLECTIONS.analysisRecords, analysisId);
      await deleteDoc(recordsRef);
    },
    [firestore],
  );

  return { deleteAnalysisRecords };
};
