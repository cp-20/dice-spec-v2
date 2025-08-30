import type { MiddlewareConfig, NextMiddleware } from 'next/server';
import { i18nMiddleware } from '@/shared/i18n/middleware';

export const config: MiddlewareConfig = {
  matcher: [
    '/',
    '/expect',
    '/dice',
    '/analyze-logs',
    '/ccfolia',
    '/blogs',
    '/blogs/:category',
    '/blogs/:category/:slug',
  ],
};

export const middleware: NextMiddleware = (req, event) => {
  return i18nMiddleware(req, event);
};
