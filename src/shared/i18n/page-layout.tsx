import * as i18n from 'i18next';
import type { NextPage } from 'next';
import { i18nConfig, type Locale } from '@/shared/i18n/config';

export const wrapPage = (Page: NextPage) => {
  const WrappedPage: NextPage<{ params: Promise<{ locale: string }> }> = async ({ params }) => {
    const p = await params;
    const locale = i18nConfig.locales.includes(p.locale as Locale) ? (p.locale as Locale) : i18nConfig.defaultLocale;
    i18n.changeLanguage(locale);
    return <Page />;
  };

  return WrappedPage;
};
