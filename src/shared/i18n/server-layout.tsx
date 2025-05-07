import * as i18n from 'i18next';
import type { FC, ReactNode } from 'react';
import { i18nextInitOptions } from '@/locales/i18next';
import { i18nConfig, type Locale } from '@/shared/i18n/config';

i18n.init(i18nextInitOptions, (err) => {
  if (err) {
    console.error('i18next failed to initialize', err);
  }
});

export const wrapRootLayout = (RootLayout: FC<{ children: ReactNode; locale: string }>) => {
  const WrappedRootLayout: FC<{
    children: ReactNode;
    params: Promise<{ locale: string }>;
  }> = async ({ children, params }) => {
    const p = await params;
    const locale = i18nConfig.locales.includes(p.locale as Locale) ? (p.locale as Locale) : i18nConfig.defaultLocale;
    i18n.changeLanguage(locale);
    return <RootLayout locale={locale}>{children}</RootLayout>;
  };

  return WrappedRootLayout;
};
