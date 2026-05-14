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
import { useAnalysisOgImage } from '@/app/[locale]/(app)/analyze-logs/_components/hooks/useAnalysisOgImage';
import {
  deleteAnalysisOgImageFromStorage,
  updateAnalysisOgImageMetadataInStorage,
  uploadAnalysisOgImageToStorage,
} from '@/shared/lib/firebase/storage/analysisOgImages';
import {
  deleteAnalysisRecordsFromStorage,
  updateAnalysisRecordsMetadataInStorage,
  uploadAnalysisRecordsToStorage,
} from '@/shared/lib/firebase/storage/analysisRecords';
import { useFirebase } from '@/shared/lib/firebase/useFirebase';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';

import {
  analysesStoreSchema,
  type AnalysisVisibilityLevel,
  COLLECTIONS,
  type NewAnalysisDocument,
} from '../collections';
import { useInvalidatePublicAnalysesCache } from './publicAnalyses';

export type SaveAnalysisPayload = Omit<
  NewAnalysisDocument,
  'id' | 'createdAt' | 'updatedAt' | 'characterResults' | 'primaryDeviationScore'
> & {
  characterResults: DiceResultForCharacter[];
};

type SyncAnalysisOgImageParams = {
  id: string;
  title: string;
  ownerUid: string;
  visibilityLevel: AnalysisVisibilityLevel;
  allCharacterResult?: Pick<DiceResultForCharacter, 'summary'>;
};

const useSyncAnalysisOgImageInBackground = () => {
  const { storage } = useFirebase();
  const { generateOgImage } = useAnalysisOgImage();

  return useCallback(
    (params: SyncAnalysisOgImageParams) => {
      void (async () => {
        try {
          if (params.allCharacterResult) {
            const ogImageDataUrl = await generateOgImage(params.allCharacterResult, params.title);
            await uploadAnalysisOgImageToStorage(storage, params.id, ogImageDataUrl, {
              ownerUid: params.ownerUid,
              visibilityLevel: params.visibilityLevel,
            });
            return;
          }

          await updateAnalysisOgImageMetadataInStorage(storage, params.id, {
            ownerUid: params.ownerUid,
            visibilityLevel: params.visibilityLevel,
          });
        } catch (error) {
          console.error('Failed to sync analysis OG image in background', error);
        }
      })();
    },
    [generateOgImage, storage],
  );
};

export const useSaveAnalysis = () => {
  const { firestore, storage } = useFirebase();
  const [saving, setSaving] = useState(false);
  const syncAnalysisOgImageInBackground = useSyncAnalysisOgImageInBackground();
  const invalidatePublicAnalysesCache = useInvalidatePublicAnalysesCache();

  const saveAnalysis = useCallback(
    async (payload: SaveAnalysisPayload) => {
      setSaving(true);
      try {
        const batch = writeBatch(firestore);
        const newDoc = doc(collection(firestore, COLLECTIONS.analyses));

        const { characterResults, ...restPayload } = payload;

        const allCharacterResult = characterResults.find((result) => result.id === ALL_CHARACTER_ID);
        if (allCharacterResult === undefined) {
          throw new Error('All character result is required to save analysis');
        }
        const primaryDeviationScore = allCharacterResult.summary.deviationScore;

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

        await uploadAnalysisRecordsToStorage(storage, payload.ownerUid, newDoc.id, analysisRecordsContent, {
          visibilityLevel: payload.visibilityLevel,
          showRecordDetails: payload.showRecordDetails,
        });

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
          deleteAnalysisRecordsFromStorage(storage, payload.ownerUid, newDoc.id).catch((err) => {
            console.error('Failed to delete analysis assets from storage', err);
          });
          throw error;
        }

        syncAnalysisOgImageInBackground({
          id: newDoc.id,
          title: payload.title,
          ownerUid: payload.ownerUid,
          visibilityLevel: payload.visibilityLevel,
          allCharacterResult,
        });

        invalidatePublicAnalysesCache();

        return newDoc.id;
      } finally {
        setSaving(false);
      }
    },
    [firestore, invalidatePublicAnalysesCache, storage, syncAnalysisOgImageInBackground],
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
  const syncAnalysisOgImageInBackground = useSyncAnalysisOgImageInBackground();
  const invalidatePublicAnalysesCache = useInvalidatePublicAnalysesCache();

  const updateAnalysis = useCallback(
    async (id: string, updates: UpdateAnalysisPayload) => {
      setUpdating(true);
      try {
        const analysisRef = doc(firestore, COLLECTIONS.analyses, id);
        const shouldSyncAnalysisRecordsMetadata =
          updates.visibilityLevel !== undefined || updates.showRecordDetails !== undefined;
        const shouldSyncAnalysisOgImage = updates.title !== undefined || updates.visibilityLevel !== undefined;

        if (!shouldSyncAnalysisRecordsMetadata && !shouldSyncAnalysisOgImage) {
          await updateDoc(analysisRef, {
            ...updates,
            updatedAt: serverTimestamp(),
          });
          invalidatePublicAnalysesCache();
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

        if (shouldSyncAnalysisRecordsMetadata) {
          await updateAnalysisRecordsMetadataInStorage(storage, beforeAnalysis.ownerUid, id, nextMetadata);
        }

        try {
          await updateDoc(analysisRef, {
            ...updates,
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          if (shouldSyncAnalysisRecordsMetadata) {
            await updateAnalysisRecordsMetadataInStorage(storage, beforeAnalysis.ownerUid, id, previousMetadata);
          }

          throw error;
        }

        invalidatePublicAnalysesCache();

        if (shouldSyncAnalysisOgImage) {
          const allCharacterResult = beforeAnalysis.characterResults.find((result) => result.id === ALL_CHARACTER_ID);
          if (allCharacterResult === undefined) {
            console.error('All character result not found, skipping OG image sync');
            return;
          }
          const shouldRegenerateOgImage = updates.title !== undefined && updates.title.trim() !== beforeAnalysis.title;

          syncAnalysisOgImageInBackground({
            id,
            title: updates.title ?? beforeAnalysis.title,
            ownerUid: beforeAnalysis.ownerUid,
            visibilityLevel: nextMetadata.visibilityLevel,
            allCharacterResult: shouldRegenerateOgImage ? allCharacterResult : undefined,
          });
        }
      } finally {
        setUpdating(false);
      }
    },
    [firestore, invalidatePublicAnalysesCache, storage, syncAnalysisOgImageInBackground],
  );

  return { updateAnalysis, updating };
};

export const useDeleteAnalysis = () => {
  const { firestore, storage } = useFirebase();
  const { authUser } = useFirebaseAuth();
  const [deleting, setDeleting] = useState(false);
  const invalidatePublicAnalysesCache = useInvalidatePublicAnalysesCache();

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

        await Promise.allSettled([
          deleteAnalysisRecordsFromStorage(storage, authUser.uid, id).catch((err) => {
            console.error('Failed to delete analysis records from storage', err);
          }),
          deleteAnalysisOgImageFromStorage(storage, id).catch((err) => {
            console.error('Failed to delete analysis OG image from storage', err);
          }),
        ]);

        invalidatePublicAnalysesCache();
      } finally {
        setDeleting(false);
      }
    },
    [authUser, firestore, invalidatePublicAnalysesCache, storage],
  );

  return { deleteAnalysis, deleting };
};
