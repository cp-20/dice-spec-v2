import { afterAll, afterEach, beforeAll, setDefaultTimeout, spyOn } from 'bun:test';
import { type ChildProcess, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import net from 'node:net';
import { resolve } from 'node:path';

import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setLogLevel, writeBatch } from 'firebase/firestore';

import { testEnv } from '@/shared/lib/env';

if (!testEnv) throw new Error('Firebase Rules テストは production 環境では実行できません');
const PROJECT_ID = testEnv.firebase.projectId;
const FIRESTORE_EMULATOR = {
  name: 'Firestore',
  host: testEnv.firebase.emulators.firestore.host,
  port: testEnv.firebase.emulators.firestore.rulesPort,
} as const;
const STORAGE_EMULATOR = { name: 'Storage', ...testEnv.firebase.emulators.storage } as const;

export const STORAGE_BUCKET = `gs://${testEnv.firebase.storageBucket}`;

export type TestFirestore = ReturnType<ReturnType<RulesTestEnvironment['authenticatedContext']>['firestore']>;
export type SeedDocument = { path: string; data: Record<string, unknown> };

setDefaultTimeout(60_000);

const isPortOpen = (host: string, port: number): Promise<boolean> =>
  new Promise((resolvePromise) => {
    const socket = net.createConnection({ host, port });
    const finish = (isOpen: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolvePromise(isOpen);
    };

    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
    socket.setTimeout(500);
    socket.once('timeout', () => finish(false));
  });

const waitForPortOpen = async (host: string, port: number, timeoutMs: number) => {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (await isPortOpen(host, port)) return;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 200));
  }

  throw new Error(`Emulator の起動待機がタイムアウトしました: ${host}:${port}`);
};

const waitForEmulator = async (
  processRef: ChildProcess,
  emulator: typeof FIRESTORE_EMULATOR | typeof STORAGE_EMULATOR,
) => {
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const cleanup = () => {
      processRef.off('error', onError);
      processRef.off('exit', onExit);
    };
    const resolveWait = () => {
      cleanup();
      resolvePromise();
    };
    const rejectWait = (error: unknown) => {
      cleanup();
      rejectPromise(error);
    };
    const onError = (error: Error) => {
      rejectWait(new Error(`Firebase Emulator CLI の起動に失敗しました: ${emulator.name}`, { cause: error }));
    };
    const onExit = (code: number | null, signal: NodeJS.Signals | null) => {
      rejectWait(
        new Error(
          `${emulator.name} Emulator の準備前に CLI が終了しました (code=${String(code)}, signal=${String(signal)})`,
        ),
      );
    };

    if (processRef.exitCode !== null || processRef.signalCode !== null) {
      onExit(processRef.exitCode, processRef.signalCode);
      return;
    }

    processRef.once('error', onError);
    processRef.once('exit', onExit);
    void waitForPortOpen(emulator.host, emulator.port, 30_000).then(resolveWait, rejectWait);
  });
};

const stopEmulator = async (processRef: ChildProcess) => {
  if (processRef.pid === undefined || processRef.exitCode !== null || processRef.signalCode !== null) return;

  processRef.kill('SIGINT');
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const timer = setTimeout(() => {
      processRef.kill('SIGKILL');
      resolvePromise();
    }, 5_000);

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

export const setupRulesTestEnvironment = () => {
  let testEnv: RulesTestEnvironment | undefined;
  let emulatorProcess: ChildProcess | undefined;
  let startedByTest = false;
  const errorSpy = spyOn(console, 'error');

  const environment = () => {
    if (!testEnv) throw new Error('RulesTestEnvironment が初期化されていません');
    return testEnv;
  };

  beforeAll(async () => {
    errorSpy.mockImplementation(() => {});
    setLogLevel('silent');

    const emulatorStates = await Promise.all(
      [FIRESTORE_EMULATOR, STORAGE_EMULATOR].map(async (emulator) => ({
        emulator,
        running: await isPortOpen(emulator.host, emulator.port),
      })),
    );
    const missingEmulators = emulatorStates.filter(({ running }) => !running).map(({ emulator }) => emulator);

    if (missingEmulators.length > 0) {
      emulatorProcess = spawn(
        process.execPath,
        [
          'x',
          'firebase',
          'emulators:start',
          '--only',
          missingEmulators.map(({ name }) => name.toLowerCase()).join(','),
          '--project',
          PROJECT_ID,
          '--config',
          'firebase/firebase.json',
        ],
        { cwd: process.cwd(), stdio: 'inherit' },
      );
      startedByTest = true;

      try {
        await Promise.all(missingEmulators.map((emulator) => waitForEmulator(emulatorProcess!, emulator)));
      } catch (error) {
        await stopEmulator(emulatorProcess);
        emulatorProcess = undefined;
        startedByTest = false;
        throw error;
      }
    }

    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        host: FIRESTORE_EMULATOR.host,
        port: FIRESTORE_EMULATOR.port,
        rules: readFileSync(resolve(process.cwd(), 'firebase/firestore.rules'), 'utf8'),
      },
      storage: {
        host: STORAGE_EMULATOR.host,
        port: STORAGE_EMULATOR.port,
        rules: readFileSync(resolve(process.cwd(), 'firebase/storage.rules'), 'utf8'),
      },
    });
  });

  afterEach(async () => {
    if (!testEnv) return;
    await Promise.all([testEnv.clearFirestore(), testEnv.clearStorage()]);
  });

  afterAll(async () => {
    errorSpy.mockRestore();
    await testEnv?.cleanup();
    if (startedByTest && emulatorProcess) await stopEmulator(emulatorProcess);
  });

  return {
    firestore: (uid: string) => environment().authenticatedContext(uid).firestore(),
    anonymousFirestore: () => environment().unauthenticatedContext().firestore(),
    storage: (uid: string) => environment().authenticatedContext(uid).storage(STORAGE_BUCKET),
    anonymousStorage: () => environment().unauthenticatedContext().storage(STORAGE_BUCKET),
    seedFirestore: async (...documents: SeedDocument[]) => {
      await environment().withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        const batch = writeBatch(db);
        for (const document of documents) batch.set(doc(db, document.path), document.data);
        await batch.commit();
      });
    },
  };
};

export type RulesTestHarness = ReturnType<typeof setupRulesTestEnvironment>;
