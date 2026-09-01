import { test as base } from '@playwright/test';

import { testEnv } from '@/shared/lib/env';

if (!testEnv) throw new Error('E2E テストは production 環境では実行できません');
const { firebase } = testEnv;
const projectId = firebase.projectId;
const databaseId = firebase.firestoreDatabaseId;
const authOrigin = firebase.emulators.auth.url;
const firestoreOrigin = `http://${firebase.emulators.firestore.host}:${firebase.emulators.firestore.e2ePort}`;
// `/` は認証を必要としないため、E2E用にAuthを常時起動せず、認証を利用するCCFOLIA画面でログインする。
const appPath = '/ccfolia';

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields: Record<string, FirestoreValue> } };

type FirestoreDocument = {
  name: string;
};

export type SeedCharacter = {
  id: string;
  name: string;
  revision?: number;
  memo?: string;
  commands?: string;
  color?: string;
};

export type FirebaseE2eUser = {
  uid: string;
  email: string;
  seedCharacters: (characters: SeedCharacter[]) => Promise<void>;
};

type WorkerAuthState = FirebaseE2eUser & {
  password: string;
};

type TestFixtures = {
  firebaseUser: FirebaseE2eUser;
};

type WorkerFixtures = {
  firebaseWorker: WorkerAuthState;
};

const ownerHeaders = {
  Authorization: 'Bearer owner',
  'Content-Type': 'application/json',
};

const firestoreDocumentUrl = (documentPath: string) =>
  `${firestoreOrigin}/v1/projects/${projectId}/databases/${databaseId}/documents/${documentPath}`;

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`E2E Firebase request failed: ${response.status} ${await response.text()}`);
  }
  return (await response.json()) as T;
};

const patchDocument = async (documentPath: string, fields: Record<string, FirestoreValue>) => {
  await requestJson(firestoreDocumentUrl(documentPath), {
    method: 'PATCH',
    headers: ownerHeaders,
    body: JSON.stringify({ fields }),
  });
};

const deleteDocument = async (documentName: string) => {
  const response = await fetch(`${firestoreOrigin}/v1/${documentName}`, {
    method: 'DELETE',
    headers: ownerHeaders,
  });
  if (!response.ok && response.status !== 404) {
    throw new Error(`E2E Firebase document delete failed: ${response.status} ${await response.text()}`);
  }
};

const userFields = (uid: string, characterCount: number): Record<string, FirestoreValue> => {
  const now = new Date().toISOString();
  return {
    id: { stringValue: uid },
    name: { stringValue: `E2E User ${uid.slice(0, 8)}` },
    plan: { stringValue: 'free' },
    createdAt: { timestampValue: now },
    updatedAt: { timestampValue: now },
    stripeCustomerId: { stringValue: `cus_e2e_${uid}` },
    stripeSubscriptionId: { stringValue: '' },
    analysisCount: { integerValue: '0' },
    analysisCountSyncAnalysisId: { nullValue: null },
    ccfoliaCharacterCount: { integerValue: String(characterCount) },
    ccfoliaCharacterCountSyncCharacterId: { nullValue: null },
  };
};

const characterFields = (character: SeedCharacter): Record<string, FirestoreValue> => {
  const now = new Date().toISOString();
  return {
    id: { stringValue: character.id },
    schemaVersion: { integerValue: '1' },
    revision: { integerValue: String(character.revision ?? 1) },
    name: { stringValue: character.name },
    memo: { stringValue: character.memo ?? '' },
    initiative: { nullValue: null },
    externalUrl: { stringValue: '' },
    status: {
      arrayValue: {
        values: [
          {
            mapValue: {
              fields: {
                label: { stringValue: 'HP' },
                value: { integerValue: '10' },
                max: { integerValue: '10' },
              },
            },
          },
        ],
      },
    },
    params: { arrayValue: {} },
    color: { stringValue: character.color ?? '#888888' },
    commands: { stringValue: character.commands ?? '' },
    createdAt: { timestampValue: now },
    updatedAt: { timestampValue: now },
  };
};

const listCharacterDocuments = async (uid: string): Promise<FirestoreDocument[]> => {
  const response = await fetch(`${firestoreDocumentUrl(`users/${uid}/ccfoliaCharacters`)}?pageSize=1000`, {
    headers: ownerHeaders,
  });
  if (response.status === 404) return [];
  if (!response.ok) {
    throw new Error(`E2E Firebase document list failed: ${response.status} ${await response.text()}`);
  }
  const body = (await response.json()) as { documents?: FirestoreDocument[] };
  return body.documents ?? [];
};

const seedCharactersForUser = async (uid: string, characters: SeedCharacter[]) => {
  const existingDocuments = await listCharacterDocuments(uid);
  await Promise.all(existingDocuments.map(({ name }) => deleteDocument(name)));
  await Promise.all(
    characters.map((character) =>
      patchDocument(`users/${uid}/ccfoliaCharacters/${character.id}`, characterFields(character)),
    ),
  );
  await patchDocument(`users/${uid}`, userFields(uid, characters.length));
};

const createAuthUser = async (email: string, password: string): Promise<string> => {
  const response = await requestJson<{ localId: string }>(
    `${authOrigin}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebase.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    },
  );
  return response.localId;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  firebaseWorker: [
    async ({ browserName }, use, workerInfo) => {
      const uniqueWorkerId = `${browserName}-${process.pid}-${workerInfo.parallelIndex}-${Date.now()}`;
      const email = `dice-spec-e2e-${uniqueWorkerId}@dicespec.test`;
      const password = `e2e-password-${uniqueWorkerId}`;
      const uid = await createAuthUser(email, password);
      await seedCharactersForUser(uid, []);

      const seedCharacters = (characters: SeedCharacter[]) => seedCharactersForUser(uid, characters);
      await use({ uid, email, password, seedCharacters });
      await seedCharacters([]);
    },
    { scope: 'worker', timeout: 120_000 },
  ],

  firebaseUser: async ({ firebaseWorker, page }, use) => {
    await firebaseWorker.seedCharacters([]);
    await page.goto(appPath);
    await page.waitForFunction(() => typeof window.__diceSpecFirebaseEmulatorSignIn === 'function');
    await page.evaluate(
      async ({ email, password }) => {
        await window.__diceSpecFirebaseEmulatorSignIn?.(email, password);
      },
      { email: firebaseWorker.email, password: firebaseWorker.password },
    );
    await page.getByRole('button', { name: 'アカウントに新規保存' }).waitFor();
    await use(firebaseWorker);
  },
});

export { expect } from '@playwright/test';
