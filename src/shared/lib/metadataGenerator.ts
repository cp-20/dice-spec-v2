import type { Metadata, Viewport } from 'next';
import { i18nConfig, type Locale } from '@/shared/i18n/config';

export type Option = {
  title?: string;
  description: string;
  path: string;
  locale: Locale;
  ogp?: string;
};

export const appBaseUrl = 'https://dicespec.app';

export const constructLocaleUrl = (path: string, locale: Locale): string => {
  const localePathPrefix = locale === i18nConfig.defaultLocale ? '' : `/${locale}`;
  const rawPath = `${localePathPrefix}${path}`;
  const beautifiedPath = rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;
  const url = appBaseUrl + beautifiedPath;

  return url;
};

export const constructAlternateUrls = (path: string, locale: Locale): Record<Locale, string> => {
  return i18nConfig.locales
    .filter((l) => l !== locale)
    .reduce(
      (acc, locale) => {
        acc[locale] = constructLocaleUrl(path, locale);
        return acc;
      },
      {} as Record<Locale, string>,
    );
};

export const metadataHelper = ({ title: rawTitle, description, path, locale, ogp }: Option) => {
  const appName = {
    en: 'DiceSpec',
    ja: 'ダイススペック',
  }[locale];
  const defaultOgImage = {
    en: `${appBaseUrl}/ogp-en.png`,
    ja: `${appBaseUrl}/ogp.png`,
  }[locale];
  const title = rawTitle ? `${rawTitle} - ${appName}` : appName;

  const appUrl = constructLocaleUrl(path, locale);
  const alternates = constructAlternateUrls(path, locale);

  return {
    title,
    description,
    metadataBase: appUrl,
    alternates: {
      languages: alternates,
      canonical: appUrl.toString(),
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale,
      siteName: title,
      images: ogp ?? defaultOgImage,
      url: appUrl,
    },
    manifest: '/manifest.webmanifest',
    icons: [
      {
        rel: 'icon',
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        rel: 'icon',
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
      {
        rel: 'apple-touch-icon',
        url: '/apple-touch-icon.png',
      },
    ],
    twitter: {
      title,
      description,
      images: ogp ?? defaultOgImage,
      card: 'summary_large_image',
      site: '@__cp20__',
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? '',
    },
  } satisfies Metadata;
};

export const viewportGenerator = (): Viewport => ({
  width: 'device-width',
  initialScale: 1,
  themeColor: '#334155',
});

type MetadataProps = {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export type MetadataGenerator = (props: MetadataProps) => Promise<Metadata>;

export const localeHelper = async (props: MetadataProps): Promise<Locale> => {
  const params = await props.params;
  if (typeof params.locale !== 'string') return i18nConfig.defaultLocale;
  if (!i18nConfig.locales.includes(params.locale as Locale)) return i18nConfig.defaultLocale;
  return params.locale as Locale;
};
