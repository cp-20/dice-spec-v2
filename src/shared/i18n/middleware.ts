import { type NextMiddleware, NextResponse } from 'next/server';
import { i18nConfig } from './config';

export const i18nMiddleware: NextMiddleware = (req) => {
  const url = new URL(req.url);
  if (i18nConfig.locales.some((l) => url.pathname.startsWith(`/${l}`))) return;
  url.pathname = `/${i18nConfig.defaultLocale}${url.pathname}`;
  return NextResponse.rewrite(url.toString());
};
