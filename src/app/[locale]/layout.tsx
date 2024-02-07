import 'ress';
import '@/shared/styles/globals.css';
import clsx from 'clsx';
import { Next13NProgress } from 'nextjs13-progress';
import type { FC, ReactNode } from 'react';
import { GoogleTagManager } from '@/shared/components/GoogleTagManager';
import { WebVitals } from '@/shared/components/elements/WebVitals';
import { fontNotoSansJP } from '@/shared/fonts/NotoSansJP';
import { I18nProvider } from '@/shared/i18n/client-layout';
import { wrapRootLayout } from '@/shared/i18n/server-layout';

const RootLayout: FC<{ children: ReactNode; locale: string }> = ({
  children,
  locale,
}) => {
  return (
    <>
      <I18nProvider>
        <html lang={locale} className="h-full">
          <body
            className={clsx('h-full text-slate-700', fontNotoSansJP.className)}
          >
            <GoogleTagManager />
            <WebVitals />
            <Next13NProgress color="#334155" options={{ showSpinner: false }} />

            {children}
          </body>
        </html>
      </I18nProvider>
    </>
  );
};

export default wrapRootLayout(RootLayout);
