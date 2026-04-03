import {
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  type Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import * as v from 'valibot';
import { ALL_CHARACTER_ID } from '@/app/[locale]/(app)/analyze-logs/_components/constants';
import type { DiceResultForCharacter } from '@/app/[locale]/(app)/analyze-logs/_components/hooks/ccfoliaLogAnalysis';
import {
  deleteAnalysisRecordsFromStorage,
  updateAnalysisRecordsMetadataInStorage,
  uploadAnalysisRecordsToStorage,
} from '@/shared/lib/firebase/storage/analysisRecords';
import { storagePaths } from '@/shared/lib/firebase/storage/paths';
import { useFirebase } from '@/shared/lib/firebase/useFirebase';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';
import {
  analysesStoreSchema,
  type AnalysisVisibilityLevel,
  COLLECTIONS,
  type NewAnalysisDocument,
} from '../collections';

export type SaveAnalysisPayload = Omit<
  NewAnalysisDocument,
  'id' | 'createdAt' | 'updatedAt' | 'characterResults' | 'primaryDeviationScore'
> & {
  characterResults: DiceResultForCharacter[];
};

export const useSaveAnalysis = () => {
  const { firestore, storage } = useFirebase();
  const [saving, setSaving] = useState(false);

  const saveAnalysis = useCallback(
    async (payload: SaveAnalysisPayload) => {
      setSaving(true);
      try {
        const batch = writeBatch(firestore);
        const newDoc = doc(collection(firestore, COLLECTIONS.analyses));

        const { characterResults, ...restPayload } = payload;

        const primaryCharacter = characterResults.find((result) => result.id === ALL_CHARACTER_ID);
        const primaryDeviationScore = primaryCharacter?.summary.deviationScore ?? 0;

        const newDocData: NewAnalysisDocument = {
          ...restPayload,
          characterResults: characterResults.map((result) => ({
            id: result.id,
            name: result.name,
            summary: result.summary,
            summaryRecords: result.results.map((record) => ({
              evaluation: record.evaluation,
              results: record.results,
              target: record.target,
              skillName: record.skillName,
              evaluationStatus: record.evaluationStatus,
            })),
          })),
          primaryDeviationScore,
          id: newDoc.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        batch.set(newDoc, newDocData);

        const analysisRecordsContent = {
          characterRecords: payload.characterResults.map((result) => ({
            characterId: result.id,
            records: result.results,
          })),
        };

        const storagePath = await uploadAnalysisRecordsToStorage(
          storage,
          payload.ownerUid,
          newDoc.id,
          analysisRecordsContent,
          {
            visibilityLevel: payload.visibilityLevel,
            showRecordDetails: payload.showRecordDetails,
          },
        );

        const userRef = doc(firestore, COLLECTIONS.users, payload.ownerUid);
        batch.set(
          userRef,
          {
            analysisCount: increment(1),
            analysisCountSyncAnalysisId: newDoc.id,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        try {
          await batch.commit();
        } catch (error) {
          // なるべく storage と firestore で同期を取る
          await deleteAnalysisRecordsFromStorage(storage, storagePath).catch(() => undefined);
          throw error;
        }

        return newDoc.id;
      } finally {
        setSaving(false);
      }
    },
    [firestore, storage],
  );

  return { saveAnalysis, saving };
};

export type UpdateAnalysisPayload = Partial<{
  title: string;
  visibilityLevel: AnalysisVisibilityLevel;
  showRecordDetails: boolean;
  sessionDate: Timestamp;
}>;

export const useUpdateAnalysis = () => {
  const { firestore, storage } = useFirebase();
  const [updating, setUpdating] = useState(false);

  const updateAnalysis = useCallback(
    async (id: string, updates: UpdateAnalysisPayload) => {
      setUpdating(true);
      try {
        const analysisRef = doc(firestore, COLLECTIONS.analyses, id);
        const shouldSyncStorageMetadata =
          updates.visibilityLevel !== undefined || updates.showRecordDetails !== undefined;

        if (!shouldSyncStorageMetadata) {
          await updateDoc(analysisRef, {
            ...updates,
            updatedAt: serverTimestamp(),
          });
          return;
        }

        const beforeSnap = await getDoc(analysisRef);
        if (!beforeSnap.exists()) {
          throw new Error('Analysis not found');
        }
        const beforeAnalysis = v.parse(analysesStoreSchema, beforeSnap.data({ serverTimestamps: 'estimate' }));
        const previousMetadata = {
          visibilityLevel: beforeAnalysis.visibilityLevel,
          showRecordDetails: beforeAnalysis.showRecordDetails,
        };
        const nextMetadata = {
          visibilityLevel: updates.visibilityLevel ?? previousMetadata.visibilityLevel,
          showRecordDetails: updates.showRecordDetails ?? previousMetadata.showRecordDetails,
        };

        const storagePath = storagePaths.getAnalysisRecordsPath(beforeAnalysis.ownerUid, id);
        await updateAnalysisRecordsMetadataInStorage(storage, storagePath, nextMetadata);

        try {
          await updateDoc(analysisRef, {
            ...updates,
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          await updateAnalysisRecordsMetadataInStorage(storage, storagePath, previousMetadata).catch(() => undefined);
          throw error;
        }
      } finally {
        setUpdating(false);
      }
    },
    [firestore, storage],
  );

  return { updateAnalysis, updating };
};

export const useDeleteAnalysis = () => {
  const { firestore, storage } = useFirebase();
  const { authUser } = useFirebaseAuth();
  const [deleting, setDeleting] = useState(false);

  const deleteAnalysis = useCallback(
    async (id: string) => {
      if (!authUser) return;

      setDeleting(true);
      try {
        const batch = writeBatch(firestore);
        const analysisRef = doc(firestore, COLLECTIONS.analyses, id);
        batch.delete(analysisRef);

        const userRef = doc(firestore, COLLECTIONS.users, authUser.uid);
        batch.set(
          userRef,
          {
            analysisCount: increment(-1),
            analysisCountSyncAnalysisId: id,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        await batch.commit();

        const storagePath = storagePaths.getAnalysisRecordsPath(authUser.uid, id);
        await deleteAnalysisRecordsFromStorage(storage, storagePath).catch(() => undefined);
      } finally {
        setDeleting(false);
      }
    },
    [authUser, firestore, storage],
  );

  return { deleteAnalysis, deleting };
};
