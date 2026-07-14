import { FirebaseError } from 'firebase/app';
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

import { ALL_CHARACTER_ID, type DiceResultForCharacter } from '@/features/log-analysis/model';
import { getFirebaseFirestore, getFirebaseStorage } from '@/shared/lib/firebase/client';
import { FIREBASE_COLLECTIONS } from '@/shared/lib/firebase/collections';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';

import {
  deleteAnalysisOgImageFromStorage,
  updateAnalysisOgImageMetadataInStorage,
  uploadAnalysisOgImageToStorage,
} from './analysisOgImagesStorage';
import {
  deleteAnalysisRecordsFromStorage,
  updateAnalysisRecordsMetadataInStorage,
  uploadAnalysisRecordsToStorage,
} from './analysisRecordsStorage';
import { shouldCloseAnalysisRecordsBeforeFirestore } from './privacy';
import { useInvalidatePublicAnalysesCache } from './publicAnalyses';
import { analysisDocumentSchema, type AnalysisVisibilityLevel, type NewAnalysisDocument } from './schema';

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

export type GenerateAnalysisOgImage = (
  result: Pick<DiceResultForCharacter, 'summary'>,
  title: string,
) => Promise<string>;

const isStorageObjectNotFound = (error: unknown) =>
  error instanceof FirebaseError && error.code === 'storage/object-not-found';

const useSyncAnalysisOgImage = (generateOgImage: GenerateAnalysisOgImage) => {
  const storage = getFirebaseStorage();

  return useCallback(
    async (params: SyncAnalysisOgImageParams) => {
      if (params.allCharacterResult) {
        const ogImageDataUrl = await generateOgImage(params.allCharacterResult, params.title);
        await uploadAnalysisOgImageToStorage(storage, params.id, ogImageDataUrl, {
          ownerUid: params.ownerUid,
          visibilityLevel: params.visibilityLevel,
        });
        return;
      }

      try {
        await updateAnalysisOgImageMetadataInStorage(storage, params.id, {
          ownerUid: params.ownerUid,
          visibilityLevel: params.visibilityLevel,
        });
      } catch (error) {
        if (!isStorageObjectNotFound(error)) throw error;
      }
    },
    [generateOgImage, storage],
  );
};

export const useSaveAnalysis = (generateOgImage: GenerateAnalysisOgImage) => {
  const firestore = getFirebaseFirestore();
  const storage = getFirebaseStorage();
  const [saving, setSaving] = useState(false);
  const syncAnalysisOgImage = useSyncAnalysisOgImage(generateOgImage);
  const invalidatePublicAnalysesCache = useInvalidatePublicAnalysesCache();

  const saveAnalysis = useCallback(
    async (payload: SaveAnalysisPayload) => {
      setSaving(true);
      try {
        const batch = writeBatch(firestore);
        const newDoc = doc(collection(firestore, FIREBASE_COLLECTIONS.analyses));

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

        const userRef = doc(firestore, FIREBASE_COLLECTIONS.users, payload.ownerUid);
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
          try {
            await deleteAnalysisRecordsFromStorage(storage, payload.ownerUid, newDoc.id);
          } catch (cleanupError) {
            throw new AggregateError([error, cleanupError], 'Failed to save analysis and clean up its records');
          }
          throw error;
        }

        // OG 画像は解析本体から再生成できる派生データなので、失敗しても保存自体は取り消さない。
        void syncAnalysisOgImage({
          id: newDoc.id,
          title: payload.title,
          ownerUid: payload.ownerUid,
          visibilityLevel: payload.visibilityLevel,
          allCharacterResult,
        }).catch((error) => console.error('Failed to sync analysis OG image in background', error));

        invalidatePublicAnalysesCache();

        return newDoc.id;
      } finally {
        setSaving(false);
      }
    },
    [firestore, invalidatePublicAnalysesCache, storage, syncAnalysisOgImage],
  );

  return { saveAnalysis, saving };
};

export type UpdateAnalysisPayload = Partial<{
  title: string;
  visibilityLevel: AnalysisVisibilityLevel;
  showRecordDetails: boolean;
  sessionDate: Timestamp;
}>;

export const useUpdateAnalysis = (generateOgImage: GenerateAnalysisOgImage) => {
  const firestore = getFirebaseFirestore();
  const storage = getFirebaseStorage();
  const [updating, setUpdating] = useState(false);
  const syncAnalysisOgImage = useSyncAnalysisOgImage(generateOgImage);
  const invalidatePublicAnalysesCache = useInvalidatePublicAnalysesCache();

  const updateAnalysis = useCallback(
    async (id: string, updates: UpdateAnalysisPayload) => {
      setUpdating(true);
      try {
        const analysisRef = doc(firestore, FIREBASE_COLLECTIONS.analyses, id);
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
        const beforeAnalysis = v.parse(analysisDocumentSchema, beforeSnap.data({ serverTimestamps: 'estimate' }));
        const previousMetadata = {
          visibilityLevel: beforeAnalysis.visibilityLevel,
          showRecordDetails: beforeAnalysis.showRecordDetails,
        };
        const nextMetadata = {
          visibilityLevel: updates.visibilityLevel ?? previousMetadata.visibilityLevel,
          showRecordDetails: updates.showRecordDetails ?? previousMetadata.showRecordDetails,
        };
        const closeRecordsBeforeFirestore =
          shouldSyncAnalysisRecordsMetadata &&
          shouldCloseAnalysisRecordsBeforeFirestore(previousMetadata, nextMetadata);
        const closeOgImageBeforeFirestore =
          updates.visibilityLevel === 'private' && beforeAnalysis.visibilityLevel !== 'private';

        if (closeRecordsBeforeFirestore) {
          await updateAnalysisRecordsMetadataInStorage(storage, beforeAnalysis.ownerUid, id, nextMetadata);
        }

        if (closeOgImageBeforeFirestore) {
          await syncAnalysisOgImage({
            id,
            title: updates.title ?? beforeAnalysis.title,
            ownerUid: beforeAnalysis.ownerUid,
            visibilityLevel: nextMetadata.visibilityLevel,
          });
        }

        // Firestore と Storage は同一トランザクションにできないため、公開範囲が広がらない順序を優先する。
        await updateDoc(analysisRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });

        if (shouldSyncAnalysisRecordsMetadata && !closeRecordsBeforeFirestore) {
          await updateAnalysisRecordsMetadataInStorage(storage, beforeAnalysis.ownerUid, id, nextMetadata);
        }

        invalidatePublicAnalysesCache();

        if (shouldSyncAnalysisOgImage) {
          const allCharacterResult = beforeAnalysis.characterResults.find((result) => result.id === ALL_CHARACTER_ID);
          if (allCharacterResult === undefined) throw new Error('All character result not found');
          const shouldRegenerateOgImage = updates.title !== undefined && updates.title.trim() !== beforeAnalysis.title;

          if (!closeOgImageBeforeFirestore || shouldRegenerateOgImage) {
            // タイトル変更時の再生成は派生データの更新なので、編集結果を巻き戻さない。
            void syncAnalysisOgImage({
              id,
              title: updates.title ?? beforeAnalysis.title,
              ownerUid: beforeAnalysis.ownerUid,
              visibilityLevel: nextMetadata.visibilityLevel,
              allCharacterResult: shouldRegenerateOgImage ? allCharacterResult : undefined,
            }).catch((error) => console.error('Failed to sync analysis OG image in background', error));
          }
        }
      } finally {
        setUpdating(false);
      }
    },
    [firestore, invalidatePublicAnalysesCache, storage, syncAnalysisOgImage],
  );

  return { updateAnalysis, updating };
};

export const useDeleteAnalysis = () => {
  const firestore = getFirebaseFirestore();
  const storage = getFirebaseStorage();
  const { authUser } = useFirebaseAuth();
  const [deleting, setDeleting] = useState(false);
  const invalidatePublicAnalysesCache = useInvalidatePublicAnalysesCache();

  const deleteAnalysis = useCallback(
    async (id: string) => {
      if (!authUser) return;

      setDeleting(true);
      try {
        // Firestore と Storage は同一トランザクションにできないため、公開データを残さないよう Storage を先に削除する。
        const cleanupResults = await Promise.allSettled([
          deleteAnalysisRecordsFromStorage(storage, authUser.uid, id),
          deleteAnalysisOgImageFromStorage(storage, id),
        ]);
        const cleanupErrors = cleanupResults.flatMap((result) => {
          if (result.status === 'fulfilled' || isStorageObjectNotFound(result.reason)) return [];
          return [result.reason];
        });
        if (cleanupErrors.length > 0) {
          throw new AggregateError(cleanupErrors, 'Failed to delete analysis assets');
        }

        const batch = writeBatch(firestore);
        const analysisRef = doc(firestore, FIREBASE_COLLECTIONS.analyses, id);
        batch.delete(analysisRef);

        const userRef = doc(firestore, FIREBASE_COLLECTIONS.users, authUser.uid);
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

        invalidatePublicAnalysesCache();
      } finally {
        setDeleting(false);
      }
    },
    [authUser, firestore, invalidatePublicAnalysesCache, storage],
  );

  return { deleteAnalysis, deleting };
};
