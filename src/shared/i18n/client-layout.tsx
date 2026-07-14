'use client';

import i18n, { type ResourceLanguage } from 'i18next';
import { type ReactNode, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import type { Locale } from '@/shared/i18n/config';

export const I18nProvider = ({
  children,
  locale,
  resource,
}: {
  children: ReactNode;
  locale: Locale;
  resource: ResourceLanguage;
}) => {
  const [instance] = useState(() => {
    if (!i18n.isInitialized) {
      void i18n.init({
        initAsync: false,
        lng: locale,
        fallbackLng: locale,
        defaultNS: 'translation',
        resources: { [locale]: resource },
      });
    } else {
      for (const [namespace, values] of Object.entries(resource)) {
        i18n.addResourceBundle(locale, namespace, values);
      }
      void i18n.changeLanguage(locale);
    }
    return i18n;
  });

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
};
