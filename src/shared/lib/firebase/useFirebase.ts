import type { FirebaseOptions } from 'firebase/app';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadString } from 'firebase/storage';
import { nanoid } from 'nanoid';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const databaseId = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID;
if (!databaseId) {
  throw new Error('Missing FIREBASE_FIRESTORE_DATABASE_ID in environment variables');
}

const firestoreModule = typeof window !== 'undefined' ? await import('firebase/firestore') : null;

export const useFirebase = () => {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = firestoreModule?.getFirestore(app, databaseId) as Firestore;
  const storage = getStorage(app);

  const uploadImage = async (url: string) => {
    const imagePath = `${nanoid(32)}.png`;

    const storageRef = ref(storage, imagePath);
    const snapshot = await uploadString(storageRef, url, 'data_url');
    const imageUrl = await getDownloadURL(snapshot.ref);

    return imageUrl;
  };

  return { app, auth, firestore, storage, uploadImage };
};
