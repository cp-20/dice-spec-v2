import type { FirebaseOptions } from 'firebase/app';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { clientEnv } from '@/shared/lib/env';

const firebaseConfig: FirebaseOptions = {
  apiKey: clientEnv.firebaseApiKey,
  authDomain: clientEnv.firebaseAuthDomain,
  projectId: clientEnv.firebaseProjectId,
  storageBucket: clientEnv.firebaseStorageBucket,
  appId: clientEnv.firebaseAppId,
};

const databaseId = clientEnv.firebaseFirestoreDatabaseId;

export const useFirebase = () => {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app, databaseId);
  const storage = getStorage(app);

  return { app, auth, firestore, storage };
};
