import Script from 'next/script';
import type { FC } from 'react';

import { buildEnv } from '../lib/env';

const GOOGLE_ANALYTICS_ID = 'G-L6GQDWFE3L';

export const GoogleAnalytics: FC = () => {
  if (buildEnv.nodeEnv !== 'production') return null;

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
            window.gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `,
        }}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
      />
    </>
  );
};
