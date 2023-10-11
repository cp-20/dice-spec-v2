import { useCallback, useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

export const useGoogleAnalytics = () => {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
  }, []);

  const sendEvent = useCallback(
    (event: string, params?: Record<string, unknown> | string) => {
      window.dataLayer.push({
        event,
        eventValue:
          typeof params === 'string' ? params : JSON.stringify(params),
      });
    },
    [],
  );

  return { sendEvent };
};
