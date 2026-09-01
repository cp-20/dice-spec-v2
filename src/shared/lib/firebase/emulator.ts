import type { Auth } from 'firebase/auth';
import { connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { connectFirestoreEmulator } from 'firebase/firestore';

import { testEnv } from '@/shared/lib/env';

type FirebaseEmulatorConnectionState = {
  auth: boolean;
  firestore: boolean;
};

declare global {
  interface Window {
    __diceSpecFirebaseEmulatorSignIn?: (email: string, password: string) => Promise<void>;
  }
}

const emulatorConnectionState = (): FirebaseEmulatorConnectionState => {
  const globalState = globalThis as typeof globalThis & {
    __diceSpecFirebaseEmulatorConnectionState?: FirebaseEmulatorConnectionState;
  };
  globalState.__diceSpecFirebaseEmulatorConnectionState ??= { auth: false, firestore: false };
  return globalState.__diceSpecFirebaseEmulatorConnectionState;
};

export const connectFirebaseAuthEmulator = (auth: Auth) => {
  const emulators = testEnv?.firebase.emulators.client;
  if (!emulators) return;

  const connectionState = emulatorConnectionState();
  if (!connectionState.auth) {
    connectAuthEmulator(auth, emulators.authUrl, { disableWarnings: true });
    connectionState.auth = true;
  }
  if (typeof window !== 'undefined') {
    window.__diceSpecFirebaseEmulatorSignIn ??= async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
    };
  }
};

export const connectFirebaseFirestoreEmulator = (firestore: Firestore) => {
  const emulators = testEnv?.firebase.emulators.client;
  if (!emulators) return;

  const connectionState = emulatorConnectionState();
  if (!connectionState.firestore) {
    connectFirestoreEmulator(firestore, emulators.firestoreHost, emulators.firestorePort);
    connectionState.firestore = true;
  }
};
