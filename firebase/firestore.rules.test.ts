import { afterAll, afterEach, beforeAll, describe, setDefaultTimeout, test } from 'bun:test';
import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import net from 'node:net';
import { resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  setDoc,
  setLogLevel,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

const PROJECT_ID = 'demo-dice-spec-v2';
const FIRESTORE_EMULATOR_HOST = '127.0.0.1';
const FIRESTORE_EMULATOR_PORT = 8080;

setDefaultTimeout(60000);

const now = Timestamp.fromDate(new Date('2026-03-18T00:00:00.000Z'));

const isPortOpen = (host: string, port: number): Promise<boolean> =>
  new Promise((resolvePromise) => {
    const socket = net.createConnection({ host, port });

    socket.once('connect', () => {
      socket.end();
      resolvePromise(true);
    });

    socket.once('error', () => {
      resolvePromise(false);
    });
  });

const waitForPortOpen = async (host: string, port: number, timeoutMs: number) => {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (await isPortOpen(host, port)) return;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 200));
  }

  throw new Error(`Timed out waiting for Firestore Emulator at ${host}:${port}`);
};

const stopEmulator = async (processRef: ChildProcessWithoutNullStreams) => {
  processRef.kill('SIGINT');

  await new Promise<void>((resolvePromise, rejectPromise) => {
    const timer = setTimeout(() => {
      processRef.kill('SIGKILL');
      resolvePromise();
    }, 5000);

    processRef.once('exit', () => {
      clearTimeout(timer);
      resolvePromise();
    });

    processRef.once('error', (error) => {
      clearTimeout(timer);
      rejectPromise(error);
    });
  });
};

const userDoc = (overrides: Record<string, unknown> = {}) => ({
  id: 'user_1',
  name: 'Alice',
  avatarUrl: 'https://example.com/avatar.png',
  plan: 'free',
  createdAt: now,
  updatedAt: now,
  stripeCustomerId: '',
  analysisCount: 0,
  analysisCountSyncAnalysisId: null,
  ...overrides,
});

const ownerSnapshot = (overrides: Record<string, unknown> = {}) => ({
  id: 'user_1',
  name: 'Alice',
  avatarUrl: 'https://example.com/avatar.png',
  plan: 'free',
  createdAt: now,
  updatedAt: now,
  ...overrides,
});

const analysisDoc = (analysisId: string, ownerUid: string, overrides: Record<string, unknown> = {}) => ({
  id: analysisId,
  title: 'Session 1',
  ownerUid,
  systemId: 'CoC7th',
  visibilityLevel: 'private',
  showRecordDetails: false,
  characterResults: [],
  sessionDate: now,
  createdAt: now,
  updatedAt: now,
  primaryDeviationScore: 0,
  owner: ownerSnapshot({ id: ownerUid }),
  ...overrides,
});

const analysisRecordsDoc = (analysisId: string, ownerUid: string, overrides: Record<string, unknown> = {}) => ({
  analysisId,
  ownerUid,
  isPublic: false,
  characterRecords: [],
  ...overrides,
});

type TestFirestore = ReturnType<ReturnType<RulesTestEnvironment['authenticatedContext']>['firestore']>;

const saveAnalysisWithCountSync = async (
  db: TestFirestore,
  uid: string,
  analysisId: string,
  overrides: Record<string, unknown> = {},
) => {
  const batch = writeBatch(db);
  batch.set(doc(db, `analyses/${analysisId}`), analysisDoc(analysisId, uid, overrides));
  batch.set(
    doc(db, `users/${uid}`),
    {
      analysisCount: increment(1),
      analysisCountSyncAnalysisId: analysisId,
      updatedAt: Timestamp.fromDate(new Date('2026-03-18T03:00:00.000Z')),
    },
    { merge: true },
  );
  await batch.commit();
};

const deleteAnalysisWithCountSync = async (db: TestFirestore, uid: string, analysisId: string) => {
  const batch = writeBatch(db);
  batch.delete(doc(db, `analyses/${analysisId}`));
  batch.set(
    doc(db, `users/${uid}`),
    {
      analysisCount: increment(-1),
      analysisCountSyncAnalysisId: analysisId,
      updatedAt: Timestamp.fromDate(new Date('2026-03-18T03:10:00.000Z')),
    },
    { merge: true },
  );
  await batch.commit();
};

describe('Firestore セキュリティルール', () => {
  let testEnv: RulesTestEnvironment;
  let emulatorProcess: ChildProcessWithoutNullStreams | null = null;
  let startedByTest = false;

  beforeAll(async () => {
    const alreadyRunning = await isPortOpen(FIRESTORE_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);

    // assertFails のテスト実行時にもエラーログが出るので、抑制
    setLogLevel('silent');

    if (!alreadyRunning) {
      const firebaseCli = resolve(process.cwd(), 'node_modules/.bin/firebase');
      emulatorProcess = spawn(
        firebaseCli,
        ['emulators:start', '--only', 'firestore', '--project', PROJECT_ID, '--config', 'firebase/firebase.json'],
        {
          cwd: process.cwd(),
          env: { ...process.env, FIRESTORE_EMULATOR_HOST: `${FIRESTORE_EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}` },
        },
      );
      startedByTest = true;
      await waitForPortOpen(FIRESTORE_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT, 30000);
    }

    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        host: FIRESTORE_EMULATOR_HOST,
        port: FIRESTORE_EMULATOR_PORT,
        rules: readFileSync(resolve(process.cwd(), 'firebase/firestore.rules'), 'utf8'),
      },
    });
  });

  afterEach(async () => {
    if (!testEnv) return;
    await testEnv.clearFirestore();
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }

    if (startedByTest && emulatorProcess) {
      await stopEmulator(emulatorProcess);
      emulatorProcess = null;
    }
  });

  test('users: 本人は自分のユーザードキュメントを作成・取得できる', async () => {
    const ownerDb = testEnv.authenticatedContext('user_1').firestore();

    await assertSucceeds(setDoc(doc(ownerDb, 'users/user_1'), userDoc()));
    await assertSucceeds(getDoc(doc(ownerDb, 'users/user_1')));
  });

  test('users: 他人のユーザードキュメントは取得・更新できない', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/user_1'), userDoc());
    });

    const otherDb = testEnv.authenticatedContext('user_2').firestore();

    await assertFails(getDoc(doc(otherDb, 'users/user_1')));
    await assertFails(
      updateDoc(doc(otherDb, 'users/user_1'), {
        name: 'Mallory',
        updatedAt: Timestamp.fromDate(new Date('2026-03-18T01:00:00.000Z')),
      }),
    );
  });

  test('users: 悪意のあるクライアントが任意の stripeCustomerId でユーザードキュメントを作成できない', async () => {
    const maliciousDb = testEnv.authenticatedContext('user_malicious').firestore();

    await assertFails(
      setDoc(doc(maliciousDb, 'users/user_malicious'), userDoc({ stripeCustomerId: 'cus_stolen_id_123' })),
    );
  });

  test('users: 本人でも plan と stripeCustomerId は直接変更できない', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/user_1'), userDoc());
    });

    const ownerDb = testEnv.authenticatedContext('user_1').firestore();

    await assertFails(
      updateDoc(doc(ownerDb, 'users/user_1'), {
        plan: 'pro',
        updatedAt: Timestamp.fromDate(new Date('2026-03-18T01:00:00.000Z')),
      }),
    );

    await assertFails(
      updateDoc(doc(ownerDb, 'users/user_1'), {
        stripeCustomerId: 'cus_hacked',
        updatedAt: Timestamp.fromDate(new Date('2026-03-18T01:00:00.000Z')),
      }),
    );
  });

  test('analyses: 所有者は正しい形式の解析ドキュメントを作成できる', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/user_1'), userDoc());
    });

    const ownerDb = testEnv.authenticatedContext('user_1').firestore();

    await assertSucceeds(saveAnalysisWithCountSync(ownerDb, 'user_1', 'a1'));
  });

  test('analyses: owner スナップショットが users と不一致なら作成できない', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/user_1'), userDoc());
    });

    const ownerDb = testEnv.authenticatedContext('user_1').firestore();

    await assertFails(
      saveAnalysisWithCountSync(ownerDb, 'user_1', 'a1', {
        owner: ownerSnapshot({ name: 'Tampered Name' }),
      }),
    );
  });

  test('analyses: 無料プランは3件まで作成でき、4件目は拒否される', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/free_user'), userDoc({ plan: 'free', analysisCount: 0 }));
    });

    const freeUserDb = testEnv.authenticatedContext('free_user').firestore();

    await assertSucceeds(saveAnalysisWithCountSync(freeUserDb, 'free_user', 'a1'));
    await assertSucceeds(saveAnalysisWithCountSync(freeUserDb, 'free_user', 'a2'));
    await assertSucceeds(saveAnalysisWithCountSync(freeUserDb, 'free_user', 'a3'));
    await assertFails(saveAnalysisWithCountSync(freeUserDb, 'free_user', 'a4'));
  });

  test('analyses: pro プランは3件を超えても作成できる', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/pro_user'), userDoc({ plan: 'pro', analysisCount: 0 }));
    });

    const proUserDb = testEnv.authenticatedContext('pro_user').firestore();
    const proOwner = { owner: ownerSnapshot({ plan: 'pro' }) };

    await assertSucceeds(saveAnalysisWithCountSync(proUserDb, 'pro_user', 'a1', proOwner));
    await assertSucceeds(saveAnalysisWithCountSync(proUserDb, 'pro_user', 'a2', proOwner));
    await assertSucceeds(saveAnalysisWithCountSync(proUserDb, 'pro_user', 'a3', proOwner));
    await assertSucceeds(saveAnalysisWithCountSync(proUserDb, 'pro_user', 'a4', proOwner));
  });

  test('analyses: カウンタ同期なしの単独作成は拒否される', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/user_1'), userDoc());
    });

    const ownerDb = testEnv.authenticatedContext('user_1').firestore();

    await assertFails(setDoc(doc(ownerDb, 'analyses/a1'), analysisDoc('a1', 'user_1')));
  });

  test('analyses: 削除時にカウンタ同期がなければ拒否される', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/user_1'), userDoc({ analysisCount: 1 }));
      await setDoc(doc(adminDb, 'analyses/a1'), analysisDoc('a1', 'user_1'));
    });

    const ownerDb = testEnv.authenticatedContext('user_1').firestore();

    await assertFails(deleteDoc(doc(ownerDb, 'analyses/a1')));
    await assertSucceeds(deleteAnalysisWithCountSync(ownerDb, 'user_1', 'a1'));
  });

  test('analyses: 可視性設定に応じて読み取り可否が制御される', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/owner'), userDoc());
      await setDoc(doc(adminDb, 'analyses/private1'), analysisDoc('private1', 'owner', { visibilityLevel: 'private' }));
      await setDoc(
        doc(adminDb, 'analyses/unlisted1'),
        analysisDoc('unlisted1', 'owner', { visibilityLevel: 'unlisted' }),
      );
      await setDoc(doc(adminDb, 'analyses/public1'), analysisDoc('public1', 'owner', { visibilityLevel: 'public' }));
    });

    const anonDb = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(anonDb, 'analyses/private1')));
    await assertSucceeds(getDoc(doc(anonDb, 'analyses/unlisted1')));
    await assertSucceeds(getDoc(doc(anonDb, 'analyses/public1')));
  });

  test('analyses: 一覧取得は public のみ許可され、unlisted は一覧取得できない', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/owner'), userDoc());
      await setDoc(
        doc(adminDb, 'analyses/unlisted1'),
        analysisDoc('unlisted1', 'owner', { visibilityLevel: 'unlisted' }),
      );
      await setDoc(doc(adminDb, 'analyses/public1'), analysisDoc('public1', 'owner', { visibilityLevel: 'public' }));
    });

    const anonDb = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(getDocs(query(collection(anonDb, 'analyses'), where('visibilityLevel', '==', 'public'))));
    await assertFails(getDocs(query(collection(anonDb, 'analyses'), where('visibilityLevel', '==', 'unlisted'))));
  });

  test('analyses: 所有者でも許可されたメタ項目のみ更新できる', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/user_1'), userDoc());
      await setDoc(doc(adminDb, 'analyses/a1'), analysisDoc('a1', 'user_1'));
    });

    const ownerDb = testEnv.authenticatedContext('user_1').firestore();

    await assertSucceeds(
      updateDoc(doc(ownerDb, 'analyses/a1'), {
        title: 'Updated title',
        visibilityLevel: 'public',
        showRecordDetails: true,
        sessionDate: null,
        updatedAt: Timestamp.fromDate(new Date('2026-03-18T02:00:00.000Z')),
      }),
    );

    await assertFails(
      updateDoc(doc(ownerDb, 'analyses/a1'), {
        ownerUid: 'user_2',
      }),
    );
  });

  test('analysisRecords: 所有者は作成・取得でき、他人は private な記録を取得できない', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/owner'), userDoc());
      await setDoc(doc(adminDb, 'analyses/a1'), analysisDoc('a1', 'owner', { visibilityLevel: 'private' }));
    });

    const ownerDb = testEnv.authenticatedContext('owner').firestore();
    const otherDb = testEnv.authenticatedContext('other').firestore();

    await assertSucceeds(setDoc(doc(ownerDb, 'analysisRecords/a1'), analysisRecordsDoc('a1', 'owner')));
    await assertSucceeds(getDoc(doc(ownerDb, 'analysisRecords/a1')));
    await assertFails(getDoc(doc(otherDb, 'analysisRecords/a1')));
  });

  test('analysisRecords: 紐づく analysis が public かつ showRecordDetails=true のときだけ公開読み取りできる', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/owner'), userDoc());
      await setDoc(
        doc(adminDb, 'analyses/a1'),
        analysisDoc('a1', 'owner', { visibilityLevel: 'public', showRecordDetails: true }),
      );
      await setDoc(doc(adminDb, 'analysisRecords/a1'), analysisRecordsDoc('a1', 'owner', { isPublic: true }));
    });

    const anonDb = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(anonDb, 'analysisRecords/a1')));
  });

  test('analysisRecords: 紐づく analysis が unlisted かつ showRecordDetails=true でも読み取りできる', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/owner'), userDoc());
      await setDoc(
        doc(adminDb, 'analyses/a1'),
        analysisDoc('a1', 'owner', { visibilityLevel: 'unlisted', showRecordDetails: true }),
      );
      await setDoc(doc(adminDb, 'analysisRecords/a1'), analysisRecordsDoc('a1', 'owner', { isPublic: true }));
    });

    const anonDb = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(anonDb, 'analysisRecords/a1')));
  });

  test('analysisRecords: 紐づく analysis が unlisted でも showRecordDetails=false なら読み取りできない', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/owner'), userDoc());
      await setDoc(
        doc(adminDb, 'analyses/a1'),
        analysisDoc('a1', 'owner', { visibilityLevel: 'unlisted', showRecordDetails: false }),
      );
      await setDoc(doc(adminDb, 'analysisRecords/a1'), analysisRecordsDoc('a1', 'owner', { isPublic: true }));
    });

    const anonDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anonDb, 'analysisRecords/a1')));
  });

  test('analysisRecords: 他人の analysis に対して記録を紐づけて作成できない', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/owner_1'), userDoc());
      await setDoc(doc(adminDb, 'users/owner_2'), userDoc({ name: 'Bob', stripeCustomerId: 'cus_test_456' }));
      await setDoc(doc(adminDb, 'analyses/a2'), analysisDoc('a2', 'owner_2'));
    });

    const owner1Db = testEnv.authenticatedContext('owner_1').firestore();

    await assertFails(setDoc(doc(owner1Db, 'analysisRecords/a2'), analysisRecordsDoc('a2', 'owner_1')));
  });

  test('analysisRecords: 所有者は自分の記録を削除できる', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/owner'), userDoc());
      await setDoc(doc(adminDb, 'analyses/a1'), analysisDoc('a1', 'owner'));
      await setDoc(doc(adminDb, 'analysisRecords/a1'), analysisRecordsDoc('a1', 'owner'));
    });

    const ownerDb = testEnv.authenticatedContext('owner').firestore();
    await assertSucceeds(deleteDoc(doc(ownerDb, 'analysisRecords/a1')));
  });

  test('users+analyses: name/avatarUrl 更新後に analyses.owner を batch で同期更新できる', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/user_1'), userDoc());
      await setDoc(doc(adminDb, 'analyses/a1'), analysisDoc('a1', 'user_1'));
      await setDoc(doc(adminDb, 'analyses/a2'), analysisDoc('a2', 'user_1', { title: 'Session 2' }));
    });

    const ownerDb = testEnv.authenticatedContext('user_1').firestore();
    const updatedAt = Timestamp.fromDate(new Date('2026-03-18T04:00:00.000Z'));

    const userBatch = writeBatch(ownerDb);
    userBatch.update(doc(ownerDb, 'users/user_1'), {
      name: 'Alice Updated',
      avatarUrl: 'https://example.com/avatar-updated.png',
      updatedAt,
    });
    await assertSucceeds(userBatch.commit());

    const analysesBatch = writeBatch(ownerDb);
    analysesBatch.update(doc(ownerDb, 'analyses/a1'), {
      owner: ownerSnapshot({
        name: 'Alice Updated',
        avatarUrl: 'https://example.com/avatar-updated.png',
        updatedAt,
      }),
      updatedAt,
    });
    analysesBatch.update(doc(ownerDb, 'analyses/a2'), {
      owner: ownerSnapshot({
        name: 'Alice Updated',
        avatarUrl: 'https://example.com/avatar-updated.png',
        updatedAt,
      }),
      updatedAt,
    });
    await assertSucceeds(analysesBatch.commit());
  });

  test('users+analyses: users のみ更新する batch は許可される', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/user_1'), userDoc());
      await setDoc(doc(adminDb, 'analyses/a1'), analysisDoc('a1', 'user_1'));
    });

    const ownerDb = testEnv.authenticatedContext('user_1').firestore();

    const batch = writeBatch(ownerDb);
    batch.update(doc(ownerDb, 'users/user_1'), {
      name: 'Alice Updated',
      avatarUrl: 'https://example.com/avatar-updated.png',
      updatedAt: Timestamp.fromDate(new Date('2026-03-18T04:10:00.000Z')),
    });
    await assertSucceeds(batch.commit());
  });

  test('users+analyses: analyses.owner のみ更新して users 同期がない batch は拒否される', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/user_1'), userDoc());
      await setDoc(doc(adminDb, 'analyses/a1'), analysisDoc('a1', 'user_1'));
    });

    const ownerDb = testEnv.authenticatedContext('user_1').firestore();

    const batch = writeBatch(ownerDb);
    batch.update(doc(ownerDb, 'analyses/a1'), {
      owner: ownerSnapshot({
        name: 'Alice Updated',
        avatarUrl: 'https://example.com/avatar-updated.png',
        updatedAt: Timestamp.fromDate(new Date('2026-03-18T04:20:00.000Z')),
      }),
      updatedAt: Timestamp.fromDate(new Date('2026-03-18T04:20:00.000Z')),
    });
    await assertFails(batch.commit());
  });

  test('users+analyses: updateName 相当(users.name + analyses.owner.name 同時更新)は許可される', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/user_1'), userDoc());
      await setDoc(doc(adminDb, 'analyses/a1'), analysisDoc('a1', 'user_1'));
      await setDoc(doc(adminDb, 'analyses/a2'), analysisDoc('a2', 'user_1', { title: 'Session 2' }));
    });

    const ownerDb = testEnv.authenticatedContext('user_1').firestore();
    const updatedAt = Timestamp.fromDate(new Date('2026-03-18T04:30:00.000Z'));

    const batch = writeBatch(ownerDb);
    batch.set(doc(ownerDb, 'users'), { name: 'Alice Updated', updatedAt }, { merge: true });
    batch.set(
      doc(ownerDb, 'analyses/a1'),
      {
        owner: ownerSnapshot({
          name: 'Alice Updated',
          updatedAt,
        }),
        updatedAt,
      },
      { merge: true },
    );
    batch.set(
      doc(ownerDb, 'analyses/a2'),
      {
        owner: ownerSnapshot({
          name: 'Alice Updated',
          updatedAt,
        }),
        updatedAt,
      },
      { merge: true },
    );

    await assertSucceeds(batch.commit());
  });

  test('users+analyses: updateAvatarUrl 相当(users.avatarUrl + analyses.owner.avatarUrl 同時更新)は許可される', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, 'users/user_1'), userDoc());
      await setDoc(doc(adminDb, 'analyses/a1'), analysisDoc('a1', 'user_1'));
      await setDoc(doc(adminDb, 'analyses/a2'), analysisDoc('a2', 'user_1', { title: 'Session 2' }));
    });

    const ownerDb = testEnv.authenticatedContext('user_1').firestore();
    const updatedAt = Timestamp.fromDate(new Date('2026-03-18T04:40:00.000Z'));

    const batch = writeBatch(ownerDb);
    batch.set(
      doc(ownerDb, 'users/user_1'),
      {
        avatarUrl: 'https://example.com/avatar-updated.png',
        updatedAt,
      },
      { merge: true },
    );
    batch.set(
      doc(ownerDb, 'analyses/a1'),
      {
        owner: ownerSnapshot({
          avatarUrl: 'https://example.com/avatar-updated.png',
          updatedAt,
        }),
        updatedAt,
      },
      { merge: true },
    );
    batch.set(
      doc(ownerDb, 'analyses/a2'),
      {
        owner: ownerSnapshot({
          avatarUrl: 'https://example.com/avatar-updated.png',
          updatedAt,
        }),
        updatedAt,
      },
      { merge: true },
    );

    await assertSucceeds(batch.commit());
  });
});
