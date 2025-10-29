import '@/shared/styles/globals.css';
import clsx from 'clsx';
import { Next13NProgress } from 'nextjs13-progress';
import type { FC, ReactNode } from 'react';
import { WebVitals } from '@/shared/components/elements/WebVitals';
import { GoogleTagManager } from '@/shared/components/GoogleTagManager';
import { I18nProvider } from '@/shared/i18n/client-layout';
import { wrapRootLayout } from '@/shared/i18n/server-layout';
import {
  MigrationAnnouncementBanner,
  OldAppMigrationAnnouncementBanner,
} from './_components/MigrationAnnouncementBanner';

const isOldApp = process.env.NEXT_PUBLIC_IS_OLD_APP === 'true';

const RootLayout: FC<{ children: ReactNode; locale: string }> = ({ children, locale }) => {
  return (
    <I18nProvider>
      <html lang={locale} className="h-full">
        <body className={clsx('h-full text-slate-700 font-(family-name:--font-main)')}>
          <GoogleTagManager />
          <WebVitals />
          <Next13NProgress color="#334155" options={{ showSpinner: false }} />

          {isOldApp ? <OldAppMigrationAnnouncementBanner /> : <MigrationAnnouncementBanner />}

          {children}
        </body>
      </html>
    </I18nProvider>
  );
};

export default wrapRootLayout(RootLayout);
