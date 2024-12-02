import type { NextMiddleware } from 'next/server';
import { i18nMiddleware } from '@/shared/i18n/middleware';
import { cspMiddleware } from '@/shared/lib/csp';

const normalRoutePattern = /^\/([^/]+\/)?(?:analyze-logs|ccfolia|dice|expect)?$/;

export const middleware: NextMiddleware = (req, event) => {
  cspMiddleware(req, event);

  const pathname = new URL(req.url).pathname;
  if (normalRoutePattern.test(pathname)) {
    return i18nMiddleware(req, event);
  }
};
