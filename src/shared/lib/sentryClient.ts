import { scheduleIdleTask } from './scheduleIdleTask';

let sentryPromise: Promise<typeof import('@sentry/nextjs')> | null = null;
let failedModuleRequests: { path: string; timestamp: number }[] = [];

// SDKの遅延起動より前に発生する、URLを持たないimport例外の調査に使う。
export const recordModuleLoadFailure = (event: Event) => {
  const target = event.target;
  const source =
    target instanceof HTMLScriptElement
      ? target.src
      : target instanceof HTMLLinkElement && target.rel === 'modulepreload'
        ? target.href
        : undefined;
  if (!source) return;
  const url = new URL(source);
  if (url.origin !== location.origin || !url.pathname.startsWith('/_next/static/')) return;

  // クエリやフラグメントを送らず、直近10件に限定する。
  failedModuleRequests = [...failedModuleRequests, { path: url.pathname, timestamp: Date.now() }].slice(-10);
};

export const getSentry = () => {
  sentryPromise ??= import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn: 'https://d386299f61f671f59b628106b52774ba@o4510084181131264.ingest.us.sentry.io/4510084182245376',
      tracesSampleRate: 1,
      // SDK 更新で収集範囲が広がらないよう、従来の既定値を明示する。
      dataCollection: {
        userInfo: false,
        cookies: false,
        httpHeaders: {
          request: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
          response: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
        },
        httpBodies: [],
        urlQueryParams: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
        genAI: { inputs: false, outputs: false },
        databaseQueryData: false,
        queues: false,
        graphQL: { document: false, variables: false },
      },
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1,
      debug: false,
    });

    const loadReplay = () => {
      Sentry.lazyLoadIntegration('replayIntegration')
        .then((replayIntegration) => Sentry.addIntegration(replayIntegration()))
        .catch((error) => console.error('Failed to load Sentry Replay', error));
    };

    scheduleIdleTask(loadReplay, 2_000);

    return Sentry;
  });

  return sentryPromise;
};

export const captureClientException = (error: unknown) => {
  const moduleLoading = {
    online: navigator.onLine,
    serviceWorkerControlled: Boolean(navigator.serviceWorker?.controller),
    // Sentryの既定の正規化深度でもURLが省略されないよう、要素を文字列にする。
    failedRequests: failedModuleRequests.map(({ path, timestamp }) => `${new Date(timestamp).toISOString()} ${path}`),
  };
  getSentry()
    .then((Sentry) => Sentry.captureException(error, { contexts: { module_loading: moduleLoading } }))
    .catch((sentryError) => console.error('Failed to load Sentry', sentryError));
};
