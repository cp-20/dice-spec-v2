'use client';

import { useReportWebVitals } from 'next/web-vitals';
import type { FC } from 'react';

import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

export const WebVitals: FC = () => {
  const { sendEvent } = useGoogleAnalytics();

  useReportWebVitals((metric) => {
    const { id, name, value, rating } = metric;

    sendEvent('web_vital', {
      metric_id: id,
      metric_name: name,
      non_interaction: true,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      rating,
    });
  });

  return null;
};
