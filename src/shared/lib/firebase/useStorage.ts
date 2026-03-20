import { type FirebaseStorage, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useFirebase } from '@/shared/lib/firebase/useFirebase';

export const storagePaths = {
  getAvatarPath: (uid: string) => `avatars/${uid}`,
};

export const uploadBufferToStorage = async (
  storage: FirebaseStorage,
  path: string,
  content: ArrayBuffer,
): Promise<string> => {
  const storageRef = ref(storage, path);
  const result = await uploadBytes(storageRef, content);
  const downloadUrl = await getDownloadURL(result.ref);
  return downloadUrl;
};

export const uploadBufferFromUrlToStorage = async (
  storage: FirebaseStorage,
  path: string,
  sourceUrl: string,
): Promise<string> => {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch avatar image: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  return uploadBufferToStorage(storage, path, buffer);
};

export const useStorage = () => {
  const { storage } = useFirebase();

  const uploadBuffer = async (path: string, content: ArrayBuffer): Promise<string> => {
    return uploadBufferToStorage(storage, path, content);
  };

  const uploadBufferFromUrl = async (path: string, sourceUrl: string): Promise<string> => {
    return uploadBufferFromUrlToStorage(storage, path, sourceUrl);
  };

  return { uploadBuffer, uploadBufferFromUrl };
};
