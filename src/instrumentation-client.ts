import { clearChunkReloadGuardWhenDisplayed, reloadOnceOnChunkLoadError } from '@/shared/lib/chunkLoadRecovery';
import { shouldReportClientException } from '@/shared/lib/clientException';
import { scheduleIdleTask } from '@/shared/lib/scheduleIdleTask';
import { captureClientException, getSentry } from '@/shared/lib/sentryClient';

const loadSentry = () => getSentry().catch((error) => console.error('Failed to load Sentry', error));
const scheduleSentry = () => scheduleIdleTask(loadSentry, 8_000, 8_000);

if (document.readyState === 'complete') {
  scheduleSentry();
} else {
  window.addEventListener('load', scheduleSentry, { once: true });
}

clearChunkReloadGuardWhenDisplayed();

const reportOnce = () => {
  let reported = false;
  return (error: unknown) => {
    if (reloadOnceOnChunkLoadError(error) || !shouldReportClientException(error)) return;
    if (reported) return;
    reported = true;
    captureClientException(error);
  };
};

const reportError = reportOnce();
const reportRejection = reportOnce();

window.addEventListener('error', (event) => reportError(event.error ?? event.message));
window.addEventListener('unhandledrejection', (event) => {
  if (reloadOnceOnChunkLoadError(event.reason) || !shouldReportClientException(event.reason)) {
    event.preventDefault();
    return;
  }
  reportRejection(event.reason);
});

type RouterTransitionArgs = Parameters<(typeof import('@sentry/nextjs'))['captureRouterTransitionStart']>;

export const onRouterTransitionStart = (...args: RouterTransitionArgs) => {
  void getSentry()
    .then((Sentry) => Sentry.captureRouterTransitionStart(...args))
    .catch((error) => console.error('Failed to load Sentry', error));
};
