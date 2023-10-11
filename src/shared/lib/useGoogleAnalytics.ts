import { useCallback, useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

const getParamObject = (params?: string | string[]) => {
  if (params === undefined) return {};
  if (typeof params === 'string') return { param: params };
  return Object.fromEntries(params.map((param, i) => [[`params-${i}`], param]));
};

export const useGoogleAnalytics = () => {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
  }, []);

  const sendEvent = useCallback((event: string, params?: string | string[]) => {
    window.dataLayer.push({
      event,
      ...getParamObject(params),
    });
  }, []);

  return { sendEvent };
};
