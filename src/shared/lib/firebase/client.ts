import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { clientEnv } from '@/shared/lib/env';
import {
  connectFirebaseAuthEmulator,
  connectFirebaseFirestoreEmulator,
  connectFirebaseStorageEmulator,
} from '@/shared/lib/firebase/emulator';

const getFirebaseApp = () =>
  getApps().length > 0
    ? getApp()
    : initializeApp({
        apiKey: clientEnv.firebaseApiKey,
        authDomain: clientEnv.firebaseAuthDomain,
        projectId: clientEnv.firebaseProjectId,
        storageBucket: clientEnv.firebaseStorageBucket,
        appId: clientEnv.firebaseAppId,
      });

export const getFirebaseAuth = () => {
  const auth = getAuth(getFirebaseApp());
  if (process.env.NODE_ENV !== 'production') connectFirebaseAuthEmulator(auth);
  return auth;
};

export const getFirebaseFirestore = () => {
  const firestore = getFirestore(getFirebaseApp(), clientEnv.firebaseFirestoreDatabaseId);
  if (process.env.NODE_ENV !== 'production') connectFirebaseFirestoreEmulator(firestore);
  return firestore;
};
export const getFirebaseStorage = () => {
  const storage = getStorage(getFirebaseApp());
  if (process.env.NODE_ENV !== 'production') connectFirebaseStorageEmulator(storage);
  return storage;
};
