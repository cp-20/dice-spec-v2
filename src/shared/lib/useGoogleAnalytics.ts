declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParameters = Record<string, unknown>;

export const sendGoogleAnalyticsEvent = (event: string, parameters: EventParameters = {}) => {
  window.dataLayer ??= [];
  window.gtag ??= (...args: unknown[]) => window.dataLayer.push(args);
  window.gtag('event', event, parameters);
};

export const useGoogleAnalytics = () => ({ sendEvent: sendGoogleAnalyticsEvent });
