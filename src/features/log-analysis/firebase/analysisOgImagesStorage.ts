import type { FirebaseStorage } from 'firebase/storage';

import { storagePaths } from '@/shared/lib/firebase/storage/paths';
import { deleteFromStorage, updateStorageMetadata, uploadDataUrlToStorage } from '@/shared/lib/firebase/storage/upload';

import type { AnalysisVisibilityLevel } from './schema';

interface AnalysisOgImageMetadata {
  ownerUid: string;
  visibilityLevel: AnalysisVisibilityLevel;
}

export const uploadAnalysisOgImageToStorage = async (
  storage: FirebaseStorage,
  analysisId: string,
  dataUrl: string,
  metadata: AnalysisOgImageMetadata,
) => {
  const storagePath = storagePaths.getAnalysisOgImagePath(analysisId);
  const contentType = dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,/)?.[1] ?? 'image/png';

  await uploadDataUrlToStorage(storage, storagePath, dataUrl, {
    contentType,
    customMetadata: {
      ownerUid: metadata.ownerUid,
      visibilityLevel: metadata.visibilityLevel,
    },
  });

  return storagePath;
};

export const updateAnalysisOgImageMetadataInStorage = async (
  storage: FirebaseStorage,
  analysisId: string,
  metadata: AnalysisOgImageMetadata,
) => {
  const storagePath = storagePaths.getAnalysisOgImagePath(analysisId);
  await updateStorageMetadata(storage, storagePath, {
    customMetadata: {
      ownerUid: metadata.ownerUid,
      visibilityLevel: metadata.visibilityLevel,
    },
  });
};

export const deleteAnalysisOgImageFromStorage = async (storage: FirebaseStorage, analysisId: string) => {
  const storagePath = storagePaths.getAnalysisOgImagePath(analysisId);
  await deleteFromStorage(storage, storagePath);
};
