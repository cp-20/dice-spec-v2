import { captureClientException } from './sentryClient';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParameters = Record<string, unknown>;
const NAVIGATION_EVENT_TIMEOUT = 2000;

export const sendGoogleAnalyticsEvent = (event: string, parameters: EventParameters = {}) => {
  try {
    window.dataLayer ??= [];
    window.gtag ??= function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('event', event, parameters);
    return true;
  } catch (error) {
    console.error('Failed to send Google Analytics event:', error);
    captureClientException(error);
    return false;
  }
};

export const sendGoogleAnalyticsEventBeforeNavigation = (
  event: string,
  parameters: EventParameters,
  navigate: () => void,
) => {
  let navigated = false;
  let timeoutId: number | undefined;
  const navigateOnce = () => {
    if (navigated) return;
    navigated = true;
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    navigate();
  };

  timeoutId = window.setTimeout(navigateOnce, NAVIGATION_EVENT_TIMEOUT);
  const sent = sendGoogleAnalyticsEvent(event, {
    ...parameters,
    transport_type: 'beacon',
    event_callback: navigateOnce,
    event_timeout: NAVIGATION_EVENT_TIMEOUT,
  });
  if (!sent) navigateOnce();
};

export const useGoogleAnalytics = () => ({
  sendEvent: sendGoogleAnalyticsEvent,
  sendEventBeforeNavigation: sendGoogleAnalyticsEventBeforeNavigation,
});
