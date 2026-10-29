import { scheduleIdleTask } from '@/shared/lib/scheduleIdleTask';
import { captureClientException, getSentry } from '@/shared/lib/sentryClient';

const loadSentry = () => getSentry().catch((error) => console.error('Failed to load Sentry', error));
const scheduleSentry = () => scheduleIdleTask(loadSentry, 8_000, 8_000);

if (document.readyState === 'complete') {
  scheduleSentry();
} else {
  window.addEventListener('load', scheduleSentry, { once: true });
}

window.addEventListener('error', (event) => captureClientException(event.error ?? event.message), { once: true });
window.addEventListener('unhandledrejection', (event) => captureClientException(event.reason), { once: true });

type RouterTransitionArgs = Parameters<(typeof import('@sentry/nextjs'))['captureRouterTransitionStart']>;

export const onRouterTransitionStart = (...args: RouterTransitionArgs) => {
  void getSentry()
    .then((Sentry) => Sentry.captureRouterTransitionStart(...args))
    .catch((error) => console.error('Failed to load Sentry', error));
};
