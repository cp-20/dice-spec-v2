import {
  collection,
  doc,
  increment,
  runTransaction,
  serverTimestamp,
  type Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ALL_CHARACTER_ID } from '@/app/[locale]/(app)/analyze-logs/_components/constants';
import type { DiceResultForCharacter } from '@/app/[locale]/(app)/analyze-logs/_components/hooks/ccfoliaLogAnalysis';
import { useFirebase } from '@/shared/lib/firebase/useFirebase';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';
import {
  type AnalysisRecordsDocument,
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
  const { firestore } = useFirebase();
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

        console.log('newDocData', newDocData);

        batch.set(newDoc, newDocData);

        const analysisRecordsRef = doc(firestore, COLLECTIONS.analysisRecords, newDoc.id);

        const newAnalysisRecords: AnalysisRecordsDocument = {
          analysisId: newDoc.id,
          ownerUid: payload.ownerUid,
          isPublic: payload.visibilityLevel !== 'private' && payload.showRecordDetails,
          characterRecords: payload.characterResults.map((result) => ({
            characterId: result.id,
            records: result.results,
          })),
        };

        batch.set(analysisRecordsRef, newAnalysisRecords);

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

        await batch.commit();

        return newDoc.id;
      } finally {
        setSaving(false);
      }
    },
    [firestore],
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
  const { firestore } = useFirebase();
  const [updating, setUpdating] = useState(false);

  const updateAnalysis = useCallback(
    async (id: string, updates: UpdateAnalysisPayload) => {
      setUpdating(true);
      try {
        const analysisRef = doc(firestore, COLLECTIONS.analyses, id);
        const analysisRecordsRef = doc(firestore, COLLECTIONS.analysisRecords, id);

        await runTransaction(firestore, async (transaction) => {
          const hasVisibilityLevel = updates.visibilityLevel !== undefined;
          const hasShowRecordDetails = updates.showRecordDetails !== undefined;

          let visibilityLevel = updates.visibilityLevel;
          let showRecordDetails = updates.showRecordDetails;

          if (!hasVisibilityLevel || !hasShowRecordDetails) {
            const analysisSnapshot = await transaction.get(analysisRef);
            if (!analysisSnapshot.exists()) {
              throw new Error('Analysis not found');
            }

            const currentAnalysis = analysisSnapshot.data() as Pick<
              NewAnalysisDocument,
              'visibilityLevel' | 'showRecordDetails'
            >;

            if (!hasVisibilityLevel) {
              visibilityLevel = currentAnalysis.visibilityLevel;
            }

            if (!hasShowRecordDetails) {
              showRecordDetails = currentAnalysis.showRecordDetails;
            }
          }

          const newIsPublic = visibilityLevel !== 'private' && Boolean(showRecordDetails);

          transaction.update(analysisRef, {
            ...updates,
            updatedAt: serverTimestamp(),
          });

          transaction.update(analysisRecordsRef, {
            isPublic: newIsPublic,
          });
        });
      } finally {
        setUpdating(false);
      }
    },
    [firestore],
  );

  return { updateAnalysis, updating };
};

export const useDeleteAnalysis = () => {
  const { firestore } = useFirebase();
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
        const analysisRecordsRef = doc(firestore, COLLECTIONS.analysisRecords, id);
        batch.delete(analysisRecordsRef);

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
      } finally {
        setDeleting(false);
      }
    },
    [authUser, firestore],
  );

  return { deleteAnalysis, deleting };
};
