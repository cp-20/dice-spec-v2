'use client';

import { useReportWebVitals } from 'next/web-vitals';
import type { FC } from 'react';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

export const WebVitals: FC = () => {
  const { sendRawEvent } = useGoogleAnalytics();

  useReportWebVitals((metric) => {
    console.log(metric);

    const { id, name, value, rating } = metric;

    sendRawEvent({
      event: name,
      event_label: id,
      event_action: name,
      non_interaction: true,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_category: 'Web Vitals',
      rating,
    });
  });

  return null;
};
