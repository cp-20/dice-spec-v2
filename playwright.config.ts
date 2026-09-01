import { defineConfig, devices } from '@playwright/test';

import { testEnv } from './src/shared/lib/env';

const appOrigin = 'http://127.0.0.1:3100';
if (!testEnv) throw new Error('Playwright は production 環境では実行できません');
const { firebase } = testEnv;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 4,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: appOrigin,
    locale: 'ja-JP',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `firebase emulators:exec --only auth,firestore,storage --project ${firebase.projectId} --config firebase/firebase-e2e.json "bun run dev --hostname 127.0.0.1 --port 3100"`,
    url: `${appOrigin}/`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_FIREBASE_API_KEY: firebase.apiKey,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebase.authDomain,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebase.projectId,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: firebase.storageBucket,
      NEXT_PUBLIC_FIREBASE_APP_ID: firebase.appId,
      NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID: firebase.firestoreDatabaseId,
      NEXT_PUBLIC_FIREBASE_USE_EMULATORS: 'true',
      NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL: firebase.emulators.auth.url,
      NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST: firebase.emulators.firestore.host,
      NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT: String(firebase.emulators.firestore.e2ePort),
      NEXT_PUBLIC_DISCORD_WEBHOOK_URL: 'e2e-disabled',
    },
  },
});
