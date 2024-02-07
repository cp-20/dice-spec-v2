import 'ress';
import '@/shared/styles/globals.css';
import clsx from 'clsx';
import { Next13NProgress } from 'nextjs13-progress';
import type { FC, ReactNode } from 'react';
import { GoogleTagManager } from '@/shared/components/GoogleTagManager';
import { WebVitals } from '@/shared/components/elements/WebVitals';
import { fontNotoSansJP } from '@/shared/fonts/NotoSansJP';
import { wrapRootLayout } from '@/shared/i18n/layout';

const RootLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <html lang="ja" className="h-full">
        <body
          className={clsx('h-full text-slate-700', fontNotoSansJP.className)}
        >
          <GoogleTagManager />
          <WebVitals />
          <Next13NProgress color="#334155" options={{ showSpinner: false }} />

          {children}
        </body>
      </html>
    </>
  );
};

export default wrapRootLayout(RootLayout);
