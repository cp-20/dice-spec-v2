import '@/shared/styles/globals.css';
import clsx from 'clsx';
import type { ResourceLanguage } from 'i18next';
import type { FC, ReactNode } from 'react';

import { NavigationProgress } from '@/shared/components/elements/NavigationProgress';
import { WebVitals } from '@/shared/components/elements/WebVitals';
import { GoogleTagManager } from '@/shared/components/GoogleTagManager';
import { I18nProvider } from '@/shared/i18n/client-layout';
import type { Locale } from '@/shared/i18n/config';
import { wrapRootLayout } from '@/shared/i18n/server-layout';
import { isOldApp } from '@/shared/lib/const';

import { OldAppMigrationAnnouncementBanner } from './_components/OldAppMigrationAnnouncementBanner';

const RootLayout: FC<{ children: ReactNode; locale: Locale; resource: ResourceLanguage }> = ({
  children,
  locale,
  resource,
}) => {
  return (
    <I18nProvider key={locale} locale={locale} resource={resource}>
      <html lang={locale} className="h-full">
        <body className={clsx('h-full flex flex-col text-slate-700 font-(family-name:--font-main)')}>
          <GoogleTagManager />
          <WebVitals />
          <NavigationProgress />

          {isOldApp && <OldAppMigrationAnnouncementBanner />}

          <div className="flex-1">{children}</div>
        </body>
      </html>
    </I18nProvider>
  );
};

export default wrapRootLayout(RootLayout);

export const generateStaticParams = () => {
  return [{ locale: 'ja' }, { locale: 'en' }];
};
