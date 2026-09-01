type EnvScope = 'build' | 'runtime' | 'client';

type EnvReaders = {
  [scope in EnvScope]: Record<string, () => string | undefined>;
};

const envReaders = {
  build: {
    NODE_ENV: () => process.env.NODE_ENV,
    SENTRY_AUTH_TOKEN: () => process.env.SENTRY_AUTH_TOKEN,
    CI: () => process.env.CI,
  },
  runtime: {
    APP_ORIGIN: () => process.env.APP_ORIGIN,
    STRIPE_SECRET_KEY: () => process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: () => process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_ID_PRO_MONTHLY: () => process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
    STRIPE_PRICE_ID_PRO_YEARLY: () => process.env.STRIPE_PRICE_ID_PRO_YEARLY,
    STRIPE_DISCORD_WEBHOOK_URL: () => process.env.STRIPE_DISCORD_WEBHOOK_URL,
    FIREBASE_PROJECT_ID: () => process.env.FIREBASE_PROJECT_ID,
    FIREBASE_FIRESTORE_DATABASE_ID: () => process.env.FIREBASE_FIRESTORE_DATABASE_ID,
    FIREBASE_WEB_API_KEY: () => process.env.FIREBASE_WEB_API_KEY,
    FIREBASE_STORAGE_BUCKET: () => process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_CLIENT_EMAIL: () => process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: () => process.env.FIREBASE_PRIVATE_KEY,
  },
  client: {
    NEXT_PUBLIC_FIREBASE_API_KEY: () => process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: () => process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: () => process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: () => process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_APP_ID: () => process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID: () => process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID,
    NEXT_PUBLIC_GTM_ID: () => process.env.NEXT_PUBLIC_GTM_ID,
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: () => process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    NEXT_PUBLIC_BCDICE_API_ENDPOINT: () => process.env.NEXT_PUBLIC_BCDICE_API_ENDPOINT,
    NEXT_PUBLIC_IS_OLD_APP: () => process.env.NEXT_PUBLIC_IS_OLD_APP,
    NEXT_PUBLIC_DISCORD_WEBHOOK_URL: () => process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL,
  },
} satisfies EnvReaders;

type EnvKeyMap = {
  [scope in EnvScope]: Extract<keyof (typeof envReaders)[scope], string>;
};

const readEnv = <S extends EnvScope>(key: EnvKeyMap[S], scope: S): string | undefined => {
  const scopedReaders = envReaders[scope] as Record<EnvKeyMap[S], () => string | undefined>;
  return scopedReaders[key]();
};

const checkEnv = <S extends EnvScope>(key: EnvKeyMap[S], scope: S): void => {
  const catalog = envVariableCatalog[scope] as readonly string[];
  if (!catalog.includes(key)) {
    throw new Error(
      `[env:${scope}] Environment variable "${key}" is not defined in the catalog. Please add it to the catalog before using.`,
    );
  }
};

const requiredEnv = <S extends EnvScope>(key: EnvKeyMap[S], scope: S): string => {
  checkEnv(key, scope);
  const value = readEnv(key, scope);
  if (!value) {
    throw new Error(`[env:${scope}] Missing required environment variable: ${key}`);
  }
  return value;
};

const optionalEnv = <S extends EnvScope>(key: EnvKeyMap[S], scope: S): string | undefined => {
  checkEnv(key, scope);
  return readEnv(key, scope);
};

const envVariableCatalog = {
  build: ['NODE_ENV', 'SENTRY_AUTH_TOKEN', 'CI'],
  runtime: [
    'APP_ORIGIN',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PRICE_ID_PRO_MONTHLY',
    'STRIPE_PRICE_ID_PRO_YEARLY',
    'STRIPE_DISCORD_WEBHOOK_URL',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_FIRESTORE_DATABASE_ID',
    'FIREBASE_WEB_API_KEY',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ],
  client: [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID',
    'NEXT_PUBLIC_GTM_ID',
    'NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION',
    'NEXT_PUBLIC_BCDICE_API_ENDPOINT',
    'NEXT_PUBLIC_IS_OLD_APP',
    'NEXT_PUBLIC_DISCORD_WEBHOOK_URL',
  ],
} as const satisfies {
  [scope in EnvScope]: readonly EnvKeyMap[scope][];
};

export const buildEnv = {
  get nodeEnv(): string {
    return requiredEnv('NODE_ENV', 'build');
  },
  get sentryAuthToken(): string | undefined {
    return optionalEnv('SENTRY_AUTH_TOKEN', 'build');
  },
  get ci(): string | undefined {
    return optionalEnv('CI', 'build');
  },
};

export const clientEnv = {
  get firebaseApiKey(): string {
    return requiredEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'client');
  },
  get firebaseAuthDomain(): string {
    return requiredEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'client');
  },
  get firebaseProjectId(): string {
    return requiredEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'client');
  },
  get firebaseStorageBucket(): string {
    return requiredEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'client');
  },
  get firebaseAppId(): string {
    return requiredEnv('NEXT_PUBLIC_FIREBASE_APP_ID', 'client');
  },
  get firebaseFirestoreDatabaseId(): string {
    return requiredEnv('NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID', 'client');
  },
  get gtmId(): string | undefined {
    return optionalEnv('NEXT_PUBLIC_GTM_ID', 'client');
  },
  get googleSiteVerification(): string | undefined {
    return optionalEnv('NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION', 'client');
  },
  get bcdiceApiEndpoint(): string {
    return optionalEnv('NEXT_PUBLIC_BCDICE_API_ENDPOINT', 'client') ?? 'https://bcdice.onlinesession.app';
  },
  get isOldApp(): boolean {
    return optionalEnv('NEXT_PUBLIC_IS_OLD_APP', 'client') === 'true';
  },
  get discordWebhookUrl(): string {
    return requiredEnv('NEXT_PUBLIC_DISCORD_WEBHOOK_URL', 'client');
  },
};

const createTestEnv = () => {
  const firebaseProjectId = process.env.TEST_FIREBASE_PROJECT_ID ?? 'demo-dice-spec-v2';
  const emulatorHost = '127.0.0.1';
  const storageEmulatorPort = 9199;
  const requiredTestEnv = (name: string, value: string | undefined): string => {
    if (!value) throw new Error(`[env:test] Missing required environment variable: ${name}`);
    return value;
  };

  return {
    firebase: {
      projectId: firebaseProjectId,
      apiKey: process.env.TEST_FIREBASE_API_KEY ?? 'e2e-api-key',
      authDomain: process.env.TEST_FIREBASE_AUTH_DOMAIN ?? `${firebaseProjectId}.firebaseapp.com`,
      storageBucket: process.env.TEST_FIREBASE_STORAGE_BUCKET ?? `${firebaseProjectId}.appspot.com`,
      appId: process.env.TEST_FIREBASE_APP_ID ?? 'e2e-app-id',
      firestoreDatabaseId: 'dice-spec-v2-e2e',
      emulators: {
        auth: {
          host: emulatorHost,
          port: 19099,
          get url(): string {
            return `http://${this.host}:${this.port}`;
          },
        },
        firestore: {
          host: emulatorHost,
          rulesPort: 18080,
          e2ePort: 18081,
        },
        storage: {
          host: emulatorHost,
          port: storageEmulatorPort,
        },
        get client():
          | {
              authUrl: string;
              firestoreHost: string;
              firestorePort: number;
              storageHost: string;
              storagePort: number;
            }
          | undefined {
          if (process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS !== 'true') return undefined;

          return {
            authUrl: requiredTestEnv(
              'NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL',
              process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL,
            ),
            firestoreHost: requiredTestEnv(
              'NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST',
              process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST,
            ),
            // テストで管理する設定値なので、接続に必要な数値変換だけを行う。
            firestorePort: Number.parseInt(
              requiredTestEnv(
                'NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT',
                process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT,
              ),
              10,
            ),
            storageHost: emulatorHost,
            storagePort: storageEmulatorPort,
          };
        },
      },
    },
  };
};

// テスト時のみ使うので、本番環境のコードから削られるようにする
export const testEnv = process.env.NODE_ENV === 'production' ? undefined : createTestEnv();

export const runtimeEnv = {
  get appOrigin(): string {
    return requiredEnv('APP_ORIGIN', 'runtime');
  },
  stripe: {
    get secretKey(): string {
      return requiredEnv('STRIPE_SECRET_KEY', 'runtime');
    },
    get webhookSecret(): string {
      return requiredEnv('STRIPE_WEBHOOK_SECRET', 'runtime');
    },
    get priceIdProMonthly(): string {
      return requiredEnv('STRIPE_PRICE_ID_PRO_MONTHLY', 'runtime');
    },
    get priceIdProYearly(): string {
      return requiredEnv('STRIPE_PRICE_ID_PRO_YEARLY', 'runtime');
    },
    get discordWebhookUrl(): string {
      return requiredEnv('STRIPE_DISCORD_WEBHOOK_URL', 'runtime');
    },
  },
  firebase: {
    get projectId(): string {
      return requiredEnv('FIREBASE_PROJECT_ID', 'runtime');
    },
    get firestoreDatabaseId(): string {
      return requiredEnv('FIREBASE_FIRESTORE_DATABASE_ID', 'runtime');
    },
    get webApiKey(): string {
      return requiredEnv('FIREBASE_WEB_API_KEY', 'runtime');
    },
    get storageBucket(): string {
      return requiredEnv('FIREBASE_STORAGE_BUCKET', 'runtime');
    },
    get clientEmail(): string | undefined {
      return optionalEnv('FIREBASE_CLIENT_EMAIL', 'runtime');
    },
    get privateKey(): string | undefined {
      return optionalEnv('FIREBASE_PRIVATE_KEY', 'runtime');
    },
  },
};

export const mixedEnv = {
  get firebaseStorageBucket(): string {
    return (
      optionalEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'client') ?? requiredEnv('FIREBASE_STORAGE_BUCKET', 'runtime')
    );
  },
};
