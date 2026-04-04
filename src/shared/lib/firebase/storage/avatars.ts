import { FirebaseStorage, getDownloadURL } from 'firebase/storage';
import { storagePaths } from './paths';
import { uploadBufferToStorage } from './upload';

const AVATAR_MAX_BYTES = 1 * 1024 * 1024;
const AVATAR_TARGET_SIZE = 512;

const SUPPORTED_AVATAR_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
let imageCompressionPromise: Promise<typeof import('browser-image-compression').default> | null = null;

const loadImageCompression = async () => {
  if (imageCompressionPromise === null) {
    imageCompressionPromise = import('browser-image-compression').then((mod) => mod.default);
  }

  return imageCompressionPromise;
};

export type AvatarPreparationErrorCode = 'UNSUPPORTED_FILE_TYPE' | 'INVALID_IMAGE' | 'FILE_TOO_LARGE_AFTER_COMPRESSION';

export class AvatarPreparationError extends Error {
  code: AvatarPreparationErrorCode;

  constructor(code: AvatarPreparationErrorCode, message: string) {
    super(message);
    this.name = 'AvatarPreparationError';
    this.code = code;
  }
}

const getOutputMimeType = (file: File) => {
  if (file.type === 'image/png') return 'image/png';
  if (file.type === 'image/webp') return 'image/webp';
  return 'image/jpeg';
};

const loadImageFromFile = async (file: File): Promise<HTMLImageElement> => {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new AvatarPreparationError('INVALID_IMAGE', 'Failed to load image file'));
      img.src = imageUrl;
    });

    return image;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

const createCoveredSquareBlob = async (file: File, outputType: string): Promise<Blob> => {
  const image = await loadImageFromFile(file);
  if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
    throw new AvatarPreparationError('INVALID_IMAGE', 'Image dimensions are invalid');
  }

  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_TARGET_SIZE;
  canvas.height = AVATAR_TARGET_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new AvatarPreparationError('INVALID_IMAGE', 'Canvas context is not available');
  }

  const scale = Math.max(AVATAR_TARGET_SIZE / image.naturalWidth, AVATAR_TARGET_SIZE / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const dx = (AVATAR_TARGET_SIZE - drawWidth) / 2;
  const dy = (AVATAR_TARGET_SIZE - drawHeight) / 2;

  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType, 0.92);
  });

  if (!blob) {
    throw new AvatarPreparationError('INVALID_IMAGE', 'Failed to convert image');
  }

  return blob;
};

const prepareAvatarFileForUpload = async (file: File): Promise<File> => {
  if (!SUPPORTED_AVATAR_MIME_TYPES.has(file.type)) {
    throw new AvatarPreparationError('UNSUPPORTED_FILE_TYPE', `Unsupported file type: ${file.type}`);
  }

  const outputType = getOutputMimeType(file);
  const coveredBlob = await createCoveredSquareBlob(file, outputType);
  const coveredFile = new File([coveredBlob], file.name, { type: outputType });

  const options = {
    maxSizeMB: AVATAR_MAX_BYTES / (1024 * 1024),
    maxWidthOrHeight: AVATAR_TARGET_SIZE,
    useWebWorker: true,
    fileType: outputType,
    initialQuality: 0.9,
  };

  const imageCompression = await loadImageCompression();

  let compressedFile = await imageCompression(coveredFile, options);

  if (compressedFile.size > AVATAR_MAX_BYTES && outputType !== 'image/webp') {
    compressedFile = await imageCompression(coveredFile, {
      ...options,
      fileType: 'image/webp',
      initialQuality: 1,
    });
  }

  if (compressedFile.size > AVATAR_MAX_BYTES) {
    throw new AvatarPreparationError('FILE_TOO_LARGE_AFTER_COMPRESSION', 'Avatar size exceeds 1MiB after compression');
  }

  return compressedFile;
};

export const uploadAvatarFromUrlToStorage = async (
  storage: FirebaseStorage,
  uid: string,
  imageUrl: string,
): Promise<string> => {
  const path = storagePaths.getAvatarPath(uid);
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new AvatarPreparationError(
      'INVALID_IMAGE',
      `Failed to fetch image from URL: ${res.status} ${res.statusText}`,
    );
  }
  const blob = await res.blob();
  const file = new File([blob], 'avatar', { type: blob.type });
  const preparedFile = await prepareAvatarFileForUpload(file);
  const arrayBuffer = await preparedFile.arrayBuffer();
  const result = await uploadBufferToStorage(storage, path, arrayBuffer, { contentType: preparedFile.type });
  const downloadUrl = await getDownloadURL(result.ref);
  return downloadUrl;
};

export const uploadAvatarFromFileToStorage = async (
  storage: FirebaseStorage,
  uid: string,
  file: File,
): Promise<string> => {
  const path = storagePaths.getAvatarPath(uid);
  const preparedFile = await prepareAvatarFileForUpload(file);
  const arrayBuffer = await preparedFile.arrayBuffer();
  const result = await uploadBufferToStorage(storage, path, arrayBuffer, { contentType: preparedFile.type });
  const downloadUrl = await getDownloadURL(result.ref);
  return downloadUrl;
};
