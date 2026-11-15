import { clientExceptionFingerprint, hasExceptionStack, shouldReportClientException } from './clientException';
import { scheduleIdleTask } from './scheduleIdleTask';

let sentryPromise: Promise<typeof import('@sentry/nextjs')> | null = null;

const dropNonActionable = (
  event: { message?: string; exception?: { values?: { type?: string; value?: string }[] } },
  original: unknown,
) => {
  if (original !== undefined && !shouldReportClientException(original)) return true;
  const exception = event.exception?.values?.[0];
  if (!exception) return event.message ? !shouldReportClientException(event.message) : false;
  return !shouldReportClientException({ name: exception.type ?? 'Error', message: exception.value ?? '' });
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
      beforeSend(event, hint) {
        if (dropNonActionable(event, hint.originalException)) return null;
        return event;
      },
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
  if (!shouldReportClientException(error)) return;
  // SDK の読み込みは非同期なので、stack のない例外は捕捉用 Promise の中でまとめて分類される。
  const syntheticException = new Error();
  const stackless = !hasExceptionStack(error);
  if (stackless && error instanceof Error) {
    try {
      error.stack = syntheticException.stack;
    } catch {
      // stack を書けない例外は syntheticException 側の呼び出し元を使う。
    }
  }

  getSentry()
    .then((Sentry) =>
      Sentry.captureException(error, {
        syntheticException,
        captureContext: stackless ? { fingerprint: clientExceptionFingerprint(error) } : undefined,
      }),
    )
    .catch((sentryError) => console.error('Failed to load Sentry', sentryError));
};
