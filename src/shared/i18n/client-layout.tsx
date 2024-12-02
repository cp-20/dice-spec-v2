'use client';

import i18n from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { i18nextInitOptions } from '@/locales/i18next';
import { i18nConfig } from '@/shared/i18n/config';
import { usePathname } from 'next/navigation';

i18n.init(i18nextInitOptions, (err) => {
  if (err) {
    console.error('i18next failed to initialize', err);
  }
});

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const localeCandidate = pathname.split('/')[1];
  const locale = i18nConfig.locales.includes(localeCandidate) ? localeCandidate : i18nConfig.defaultLocale;
  i18n.changeLanguage(locale);
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
