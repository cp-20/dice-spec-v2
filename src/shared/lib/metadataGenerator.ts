import type { Metadata } from 'next';

export type Option = {
  title: string;
  description: string;
  ogp?: string;
};

export const appBaseUrl = 'https://dicespec.vercel.app';
export const defaultOgImage = `${appBaseUrl}/ogp.png`;
export const appName = 'ダイススペック';

export const metadataGenerator = ({
  title: rawTitle,
  description,
  ogp,
}: Option): Metadata => {
  const title = rawTitle ? `${rawTitle} - ${appName}` : appName;

  return {
    title,
    description,
    metadataBase: new URL(appBaseUrl),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ja',
      siteName: title,
      images: ogp ?? defaultOgImage,
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
  };
};
