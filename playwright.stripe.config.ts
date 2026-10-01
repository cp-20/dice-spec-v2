import { defineConfig } from '@playwright/test';

import firebaseConfig from './firebase/firebase-stripe-e2e.json' with { type: 'json' };

// 通常の E2E・開発用 Emulator と同時に実行できるポートを使う。
process.env.TEST_FIREBASE_AUTH_EMULATOR_PORT = String(firebaseConfig.emulators.auth.port);
process.env.TEST_FIREBASE_FIRESTORE_E2E_PORT = String(firebaseConfig.emulators.firestore.port);
process.env.TEST_FIREBASE_STORAGE_EMULATOR_PORT = String(firebaseConfig.emulators.storage.port);
const { default: config } = await import('./playwright.config');
const webServer = config.webServer;
if (!webServer || Array.isArray(webServer)) throw new Error('E2E server configuration is required');

export default defineConfig({
  ...config,
  testIgnore: [],
  testMatch: '**/stripe-sandbox.e2e.ts',
  workers: 1,
  retries: 0,
  timeout: 120_000,
  webServer: {
    ...webServer,
    command: 'node e2e/stripe-server.mjs',
    timeout: 300_000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 10_000 },
    env: { ...webServer.env, STRIPE_E2E: 'true' },
  },
});
