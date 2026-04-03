import {
  deleteObject,
  type FirebaseStorage,
  getDownloadURL,
  getBytes,
  ref,
  type SettableMetadata,
  updateMetadata,
  uploadBytes,
  uploadString,
} from 'firebase/storage';

export const uploadBufferToStorage = async (
  storage: FirebaseStorage,
  path: string,
  content: ArrayBuffer,
  metadata?: SettableMetadata,
): Promise<string> => {
  const storageRef = ref(storage, path);
  const result = await uploadBytes(storageRef, content, metadata);
  const downloadUrl = await getDownloadURL(result.ref);
  return downloadUrl;
};

export const uploadBufferFromUrlToStorage = async (
  storage: FirebaseStorage,
  path: string,
  sourceUrl: string,
  metadata?: SettableMetadata,
): Promise<string> => {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch avatar image: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  return uploadBufferToStorage(storage, path, buffer, metadata);
};

export const uploadTextToStorage = async (
  storage: FirebaseStorage,
  path: string,
  content: string,
  contentType = 'text/plain; charset=utf-8',
  metadata?: SettableMetadata,
) => {
  const storageRef = ref(storage, path);
  await uploadString(storageRef, content, 'raw', { ...metadata, contentType });
};

export const downloadTextFromStorage = async (storage: FirebaseStorage, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  const bytes = await getBytes(storageRef);
  return new TextDecoder().decode(bytes);
};

export const deleteFromStorage = async (storage: FirebaseStorage, path: string) => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

export const updateStorageMetadata = async (storage: FirebaseStorage, path: string, metadata: SettableMetadata) => {
  const storageRef = ref(storage, path);
  await updateMetadata(storageRef, metadata);
};
