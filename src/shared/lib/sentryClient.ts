import { scheduleIdleTask } from './scheduleIdleTask';

let sentryPromise: Promise<typeof import('@sentry/nextjs')> | null = null;

export const getSentry = () => {
  sentryPromise ??= import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn: 'https://d386299f61f671f59b628106b52774ba@o4510084181131264.ingest.us.sentry.io/4510084182245376',
      tracesSampleRate: 1,
      enableLogs: true,
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
  getSentry()
    .then((Sentry) => Sentry.captureException(error))
    .catch((sentryError) => console.error('Failed to load Sentry', sentryError));
};
