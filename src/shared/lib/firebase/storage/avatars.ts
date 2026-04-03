import { FirebaseStorage, getDownloadURL } from 'firebase/storage';
import { storagePaths } from './paths';
import { uploadBufferFromUrlToStorage, uploadBufferToStorage } from './upload';

export const uploadAvatarFromUrlToStorage = async (
  storage: FirebaseStorage,
  uid: string,
  imageUrl: string,
): Promise<string> => {
  const path = storagePaths.getAvatarPath(uid);
  const result = await uploadBufferFromUrlToStorage(storage, path, imageUrl);
  const downloadUrl = await getDownloadURL(result.ref);
  return downloadUrl;
};

export const uploadAvatarFromFileToStorage = async (
  storage: FirebaseStorage,
  uid: string,
  file: File,
): Promise<string> => {
  const path = storagePaths.getAvatarPath(uid);
  const arrayBuffer = await file.arrayBuffer();
  const result = await uploadBufferToStorage(storage, path, arrayBuffer, { contentType: file.type });
  const downloadUrl = await getDownloadURL(result.ref);
  return downloadUrl;
};
