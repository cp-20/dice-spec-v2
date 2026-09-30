import '@/shared/styles/globals.css';
import clsx from 'clsx';
import type { FC, ReactNode } from 'react';

import { NavigationProgress } from '@/shared/components/elements/NavigationProgress';
import { ServiceWorkerRegistration } from '@/shared/components/elements/ServiceWorkerRegistration';
import { WebVitals } from '@/shared/components/elements/WebVitals';
import { GoogleAnalytics } from '@/shared/components/GoogleAnalytics';

const RootLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <html lang="ja" className="h-full">
      <body className={clsx('h-full flex flex-col text-slate-700 font-(family-name:--font-main)')}>
        <GoogleAnalytics />
        <WebVitals />
        <NavigationProgress />
        <ServiceWorkerRegistration />

        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
};

export default RootLayout;
