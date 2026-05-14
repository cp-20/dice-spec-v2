import {
  deleteObject,
  type FirebaseStorage,
  getBytes,
  ref,
  type SettableMetadata,
  updateMetadata,
  uploadBytes,
  uploadString,
  UploadResult,
} from 'firebase/storage';

export const uploadBufferToStorage = async (
  storage: FirebaseStorage,
  path: string,
  content: ArrayBuffer,
  metadata?: SettableMetadata,
): Promise<UploadResult> => {
  const storageRef = ref(storage, path);
  const result = await uploadBytes(storageRef, content, metadata);
  return result;
};

export const uploadDataUrlToStorage = async (
  storage: FirebaseStorage,
  path: string,
  dataUrl: string,
  metadata?: SettableMetadata,
): Promise<UploadResult> => {
  const storageRef = ref(storage, path);
  const result = await uploadString(storageRef, dataUrl, 'data_url', metadata);
  return result;
};

export const uploadTextToStorage = async (
  storage: FirebaseStorage,
  path: string,
  content: string,
  metadata?: SettableMetadata,
): Promise<UploadResult> => {
  const storageRef = ref(storage, path);
  const result = await uploadString(storageRef, content, 'raw', {
    contentType: 'text/plain; charset=utf-8',
    ...metadata,
  });
  return result;
};

export const uploadBufferFromUrlToStorage = async (
  storage: FirebaseStorage,
  path: string,
  sourceUrl: string,
  metadata?: SettableMetadata,
): Promise<UploadResult> => {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch buffer: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const metadataWithContentType = {
    contentType: response.headers.get('Content-Type') || undefined,
    ...metadata,
  };
  const result = await uploadBufferToStorage(storage, path, buffer, metadataWithContentType);

  return result;
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
