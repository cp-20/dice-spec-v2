import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { clientEnv } from '@/shared/lib/env';

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

export const getFirebaseAuth = () => getAuth(getFirebaseApp());
export const getFirebaseFirestore = () => getFirestore(getFirebaseApp(), clientEnv.firebaseFirestoreDatabaseId);
export const getFirebaseStorage = () => getStorage(getFirebaseApp());
