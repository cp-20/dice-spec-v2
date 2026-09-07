import { captureClientException } from './sentryClient';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    googleAnalyticsLoaded?: boolean;
  }
}

type EventParameters = Record<string, unknown>;
type EventInput = EventParameters | string | string[];
const NAVIGATION_EVENT_TIMEOUT = 2000;

const getEventParameters = (input: EventInput): EventParameters => {
  if (typeof input === 'string') return { param: input };
  if (Array.isArray(input)) return Object.fromEntries(input.map((param, index) => [`params_${index}`, param]));
  return input;
};

export const sendGoogleAnalyticsEvent = (event: string, input: EventInput = {}) => {
  try {
    window.dataLayer ??= [];
    window.gtag ??= function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('event', event, getEventParameters(input));
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
  if (!window.googleAnalyticsLoaded) {
    navigate();
    return;
  }

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
