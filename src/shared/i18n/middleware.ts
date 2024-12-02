import { NextResponse, type NextMiddleware } from 'next/server';
import { i18nConfig } from './config';

export const i18nMiddleware: NextMiddleware = (req) => {
  const url = new URL(req.url);
  console.log('i18n', url.pathname);

  if (i18nConfig.locales.some((l) => url.pathname.startsWith(`/${l}`))) return;
  url.pathname = `/${i18nConfig.defaultLocale}${url.pathname}`;
  console.log('redirecting to', url.toString());

  return NextResponse.rewrite(url.toString());
};
