import type { FirebaseOptions } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from 'firebase/storage';
import { nanoid } from 'nanoid';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const useFirebase = () => {
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);

  const uploadImage = async (url: string) => {
    const imagePath = `${nanoid(32)}.png`;

    const storageRef = ref(storage, imagePath);
    const snapshot = await uploadString(storageRef, url, 'data_url');
    const imageUrl = await getDownloadURL(snapshot.ref);

    return imageUrl;
  };

  return { uploadImage };
};
