import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useFirebase } from '@/shared/lib/firebase/useFirebase';

export const storagePaths = {
  getAvatarPath: (uid: string) => `avatars/${uid}`,
};

export const useStorage = () => {
  const { storage } = useFirebase();

  const uploadBuffer = async (path: string, content: ArrayBuffer): Promise<string> => {
    const storageRef = ref(storage, path);
    const result = await uploadBytes(storageRef, content);
    const downloadUrl = await getDownloadURL(result.ref);
    return downloadUrl;
  };

  return { uploadBuffer };
};
