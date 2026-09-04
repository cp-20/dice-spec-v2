'use client';

import Script from 'next/script';
import type { FC } from 'react';

import { buildEnv, clientEnv } from '../lib/env';

export const GoogleAnalytics: FC = () => {
  if (buildEnv.nodeEnv !== 'production') return null;
  const googleAnalyticsId = clientEnv.googleAnalyticsId;

  return (
    <>
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            window.gtag = function(){window.dataLayer.push(arguments);};
            window.gtag('js', new Date());
            window.gtag('config', ${JSON.stringify(googleAnalyticsId)});
          `,
        }}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAnalyticsId)}`}
        onLoad={() => {
          window.googleAnalyticsLoaded = true;
        }}
      />
    </>
  );
};
