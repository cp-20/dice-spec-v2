import type { Metadata, Viewport } from 'next';

import { clientEnv } from '@/shared/lib/env';

type Option = {
  title?: string;
  description: string;
  path: string;
  ogp?: string;
  noIndex?: boolean;
  noFollow?: boolean;
};

export const appBaseUrl = 'https://dicespec.app';

export const constructUrl = (path: string): string => appBaseUrl + path.replace(/\/$/, '');

export const metadataHelper = ({ title: rawTitle, description, path, ogp, noIndex, noFollow }: Option) => {
  const appName = 'ダイススペック';
  const defaultOgImage = `${appBaseUrl}/ogp.png`;
  const title = rawTitle ? `${rawTitle} - ${appName}` : appName;

  const appUrl = constructUrl(path);

  return {
    title,
    description,
    metadataBase: appUrl,
    alternates: {
      canonical: appUrl.toString(),
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ja_JP',
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
      google: clientEnv.googleSiteVerification,
    },
    robots: {
      index: !noIndex,
      follow: !noFollow,
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
