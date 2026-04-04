type EnvScope = 'build' | 'runtime' | 'client';

const readEnv = (key: string): string | undefined => process.env[key];

export const getAllProcessEnv = (): NodeJS.ProcessEnv => process.env;

const checkEnv = (key: string, scope: EnvScope): void => {
  if (!envVariableCatalog[scope].includes(key)) {
    throw new Error(
      `[env:${scope}] Environment variable "${key}" is not defined in the catalog. Please add it to the catalog before using.`,
    );
  }
};

const requiredEnv = (key: string, scope: EnvScope): string => {
  checkEnv(key, scope);
  const value = readEnv(key);
  if (!value) {
    throw new Error(`[env:${scope}] Missing required environment variable: ${key}`);
  }
  return value;
};

const optionalEnv = (key: string, scope: EnvScope): string | undefined => {
  checkEnv(key, scope);
  return readEnv(key);
};

export const envVariableCatalog = {
  build: ['ANALYZE', 'NODE_ENV', 'SENTRY_AUTH_TOKEN', 'CI'],
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
} satisfies Record<EnvScope, string[]>;

export const buildEnv = {
  get analyzeEnabled(): boolean {
    return optionalEnv('ANALYZE', 'build') === 'true';
  },
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
