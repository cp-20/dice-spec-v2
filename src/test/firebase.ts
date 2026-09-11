import { readFileSync } from 'node:fs';

import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteApp, getApp } from 'firebase/app';
import { deleteUser, signInAnonymously } from 'firebase/auth';
import { terminate } from 'firebase/firestore';

import { getFirebaseAuth, getFirebaseFirestore } from '@/shared/lib/firebase/client';

import config from '../../firebase/firebase-integration.json';

export const setupFirebaseIntegration = () => {
  vi.setConfig({ hookTimeout: 30_000, testTimeout: 15_000 });
  let environment: RulesTestEnvironment;
  const projectId = 'demo-dice-spec-integration';
  const { auth, firestore } = config.emulators;

  beforeAll(async () => {
    for (const [key, value] of Object.entries({
      NEXT_PUBLIC_FIREBASE_API_KEY: 'integration-api-key',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: `${projectId}.firebaseapp.com`,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: projectId,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: `${projectId}.appspot.com`,
      NEXT_PUBLIC_FIREBASE_APP_ID: 'integration-app-id',
      NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID: '(default)',
      NEXT_PUBLIC_FIREBASE_USE_EMULATORS: 'true',
      NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL: `http://${auth.host}:${auth.port}`,
      NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST: firestore.host,
      NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT: String(firestore.port),
    }))
      vi.stubEnv(key, value);

    environment = await initializeTestEnvironment({
      projectId,
      firestore: {
        host: firestore.host,
        port: firestore.port,
        rules: readFileSync('firebase/firestore.rules', 'utf8'),
      },
    });
  });

  beforeEach(async () => {
    await signInAnonymously(getFirebaseAuth());
  });

  afterEach(async () => {
    const user = getFirebaseAuth().currentUser;
    if (user) await deleteUser(user);
    await environment.clearFirestore();
  });

  afterAll(async () => {
    await terminate(getFirebaseFirestore());
    await deleteApp(getApp());
    await environment?.cleanup();
    vi.unstubAllEnvs();
  });

  return {
    uid: () => getFirebaseAuth().currentUser!.uid,
    seed: (path: string, data: Record<string, unknown>) =>
      environment.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(path).set(data);
      }),
  };
};
