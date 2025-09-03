import type { Metadata, Viewport } from 'next';
import { i18nConfig, type Locale } from '@/shared/i18n/config';

export type Option = {
  title?: string;
  description: string;
  locale: Locale;
  ogp?: string;
};

export const appBaseUrl = 'https://dicespec.vercel.app';

export const metadataHelper = ({ title: rawTitle, description, locale, ogp }: Option): Metadata => {
  const appName = {
    en: 'DiceSpec',
    ja: 'ダイススペック',
  }[locale];
  const defaultOgImage = {
    en: `${appBaseUrl}/ogp-en.png`,
    ja: `${appBaseUrl}/ogp.png`,
  }[locale];
  const title = rawTitle ? `${rawTitle} - ${appName}` : appName;

  const alternates = i18nConfig.locales
    .filter((lang) => lang !== locale)
    .reduce(
      (acc, lang) => {
        acc[lang] = `${appBaseUrl}/${lang}`;
        return acc;
      },
      {} as Record<Locale, string>,
    );

  return {
    title,
    description,
    metadataBase: new URL(appBaseUrl),
    alternates: {
      languages: alternates,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale,
      siteName: title,
      images: ogp ?? defaultOgImage,
      url: appBaseUrl,
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
  };
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
