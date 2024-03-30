import type { NextMiddleware } from 'next/server';
import { i18nMiddleware } from '@/shared/i18n/middleware';
import { cspMiddleware } from '@/shared/lib/csp';

const normalRoutePattern =
  /https?:\/\/[^/]+\/((?!api|static|.*\\..*|_next|favicon.ico|ogp.png|icon).*)/;

export const middleware: NextMiddleware = (req, event) => {
  cspMiddleware(req, event);

  if (normalRoutePattern.test(req.url)) {
    return i18nMiddleware(req, event);
  }
};
