import type { FirebaseStorage } from 'firebase/storage';
import { storagePaths } from './paths';
import { deleteFromStorage, downloadTextFromStorage, updateStorageMetadata, uploadTextToStorage } from './upload';
import * as v from 'valibot';
import {
  analysisRecordsContentSchema,
  type AnalysisRecordsDocument,
  type AnalysisVisibilityLevel,
} from '../stores/collections';

const analysisRecordsCache = new Map<string, Promise<AnalysisRecordsDocument> | AnalysisRecordsDocument>();

interface AnalysisRecordsMetadata {
  visibilityLevel: AnalysisVisibilityLevel;
  showRecordDetails: boolean;
}

export const uploadAnalysisRecordsToStorage = async (
  storage: FirebaseStorage,
  ownerUid: string,
  analysisId: string,
  content: AnalysisRecordsDocument,
  metadata: AnalysisRecordsMetadata,
) => {
  const storagePath = storagePaths.getAnalysisRecordsPath(ownerUid, analysisId);
  await uploadTextToStorage(storage, storagePath, JSON.stringify(content), {
    contentType: 'application/json; charset=utf-8',
    customMetadata: {
      visibilityLevel: metadata.visibilityLevel,
      showRecordDetails: String(metadata.showRecordDetails),
    },
  });
};

export const downloadAnalysisRecordsFromStorage = async (
  storage: FirebaseStorage,
  ownerUid: string,
  analysisId: string,
) => {
  const storagePath = storagePaths.getAnalysisRecordsPath(ownerUid, analysisId);
  const cachedContent = analysisRecordsCache.get(storagePath);
  if (cachedContent) {
    return await cachedContent;
  }

  const contentPromise = (async () => {
    try {
      const json = await downloadTextFromStorage(storage, storagePath);
      const content = JSON.parse(json) as unknown;
      const parsed = v.parse(analysisRecordsContentSchema, content);
      analysisRecordsCache.set(storagePath, parsed);
      return parsed;
    } catch (error) {
      analysisRecordsCache.delete(storagePath);
      throw error;
    }
  })();

  analysisRecordsCache.set(storagePath, contentPromise);
  return await contentPromise;
};

export const deleteAnalysisRecordsFromStorage = async (
  storage: FirebaseStorage,
  ownerUid: string,
  analysisId: string,
) => {
  const storagePath = storagePaths.getAnalysisRecordsPath(ownerUid, analysisId);
  await deleteFromStorage(storage, storagePath);
  analysisRecordsCache.delete(storagePath);
};

export const updateAnalysisRecordsMetadataInStorage = async (
  storage: FirebaseStorage,
  ownerUid: string,
  analysisId: string,
  metadata: AnalysisRecordsMetadata,
) => {
  const storagePath = storagePaths.getAnalysisRecordsPath(ownerUid, analysisId);
  await updateStorageMetadata(storage, storagePath, {
    customMetadata: {
      visibilityLevel: metadata.visibilityLevel,
      showRecordDetails: String(metadata.showRecordDetails),
    },
  });
};
