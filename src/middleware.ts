import type { NextMiddleware } from 'next/server';
import { i18nMiddleware } from '@/shared/i18n/middleware';
import { cspMiddleware } from '@/shared/lib/csp';

const normalRoutePattern = /^\/([^/]+\/)?(?:analyze-logs|ccfolia|dice|expect|blogs(?:\/.*)?)?$/;

export const middleware: NextMiddleware = (req, event) => {
  cspMiddleware(req, event);

  if (normalRoutePattern.test(req.nextUrl.pathname)) {
    return i18nMiddleware(req, event);
  }
};
