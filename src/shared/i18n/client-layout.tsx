'use client';

import i18n from 'i18next';
import { useCurrentLocale } from 'next-i18n-router/client';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { i18nextInitOptions } from '@/locales/i18next';
import { i18nConfig } from '@/shared/i18n/config';

i18n.init(i18nextInitOptions, (err) => {
  if (err) {
    console.error('i18next failed to initialize', err);
  }
});

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  i18n.changeLanguage(useCurrentLocale(i18nConfig));
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
