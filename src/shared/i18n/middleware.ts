import type { NextMiddleware } from 'next/server';
import { i18nRouter } from 'next-i18n-router';
import { i18nConfig } from './config';

export const i18nMiddleware: NextMiddleware = (req) => {
  return i18nRouter(req, i18nConfig);
};
