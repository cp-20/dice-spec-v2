import type { ResourceLanguage } from 'i18next';
import type { FC, ReactNode } from 'react';

import { i18nextInitOptions } from '@/locales/i18next';
import { i18nConfig, type Locale } from '@/shared/i18n/config';

import { i18n } from './server';

export const wrapRootLayout = (RootLayout: FC<{ children: ReactNode; locale: Locale; resource: ResourceLanguage }>) => {
  const WrappedRootLayout: FC<{
    children: ReactNode;
    params: Promise<{ locale: string }>;
  }> = async ({ children, params }) => {
    const p = await params;
    const locale = i18nConfig.locales.includes(p.locale as Locale) ? (p.locale as Locale) : i18nConfig.defaultLocale;
    const resource = i18nextInitOptions.resources?.[locale];
    if (!resource) throw new Error(`Missing i18n resource: ${locale}`);
    i18n.changeLanguage(locale);
    return (
      <RootLayout locale={locale} resource={resource}>
        {children}
      </RootLayout>
    );
  };

  return WrappedRootLayout;
};
