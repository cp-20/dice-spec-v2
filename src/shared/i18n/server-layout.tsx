import i18n from 'i18next';
import type { FC, ReactNode } from 'react';
import { i18nextInitOptions } from '@/locales/i18next';

i18n.init(i18nextInitOptions, (err) => {
  if (err) {
    console.error('i18next failed to initialize', err);
  }
});

export const wrapRootLayout = (RootLayout: FC<{ children: ReactNode; locale: string }>) => {
  const WrappedRootLayout: FC<{
    children: ReactNode;
    params: { locale: string };
  }> = ({ children, params: { locale } }) => {
    i18n.changeLanguage(locale);
    return <RootLayout locale={locale}>{children}</RootLayout>;
  };

  return WrappedRootLayout;
};
