import { useFirebase } from '@/shared/lib/firebase/useFirebase';
import { storagePaths } from './storage/paths';
import { uploadBufferFromUrlToStorage, uploadBufferToStorage } from './storage/upload';

export { storagePaths, uploadBufferFromUrlToStorage, uploadBufferToStorage };

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
