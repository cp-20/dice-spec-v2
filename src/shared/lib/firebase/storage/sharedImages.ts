import type { FirebaseStorage } from 'firebase/storage';
import { getDownloadURL } from 'firebase/storage';
import { storagePaths } from './paths';
import { uploadDataUrlToStorage } from './upload';

export const uploadSharedImageToStorage = async (
  storage: FirebaseStorage,
  scope: string,
  imageId: string,
  dataUrl: string,
) => {
  const storagePath = storagePaths.getSharedImagePath(scope, imageId);
  const contentType = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/)?.[1] ?? 'image/png';
  const result = await uploadDataUrlToStorage(storage, storagePath, dataUrl, { contentType });
  const imageUrl = await getDownloadURL(result.ref);
  return imageUrl;
};
