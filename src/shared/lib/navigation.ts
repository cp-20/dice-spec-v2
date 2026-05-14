import { IconDice5, IconFileExport, IconList, IconSearch, IconTimeline } from '@tabler/icons-react';

import { i18nConfig } from '../i18n/config';

export const navLinks = [
  { key: 'expect', href: '/expect', icon: IconSearch, sideNavOnly: false },
  { key: 'dice', href: '/dice', icon: IconDice5, sideNavOnly: false },
  { key: 'analyze-logs', href: '/analyze-logs', icon: IconTimeline, sideNavOnly: false },
  { key: 'analysis-list', href: '/analyze-logs/list', icon: IconList, sideNavOnly: true },
  { key: 'ccfolia', href: '/ccfolia', icon: IconFileExport, sideNavOnly: false },
] as const;

const normalizePathnameRegex = new RegExp(`^(?:/(?:${i18nConfig.locales.join('|')}))?((?:/[^/]+)*)(?:/)?$`);
export const normalizePathname = (pathname: string): string => {
  return pathname.replace(normalizePathnameRegex, '$1');
};

export type NavPaths = (typeof navLinks)[number]['href'];

const navLinksRegex = new RegExp(`^(${navLinks.map((link) => link.href).join('|')})$`);

export const isNavPath = (path: string): path is NavPaths => navLinksRegex.test(path);

export const specialPageLinks = ['/profile', '/analyze-logs/[a-zA-Z0-9]+'] as const;

export type SpecialPagePaths = (typeof specialPageLinks)[number];

const specialPageLinksRegex = new RegExp(`^(${specialPageLinks.join('|')})$`);

export const isSpecialPagePath = (path: string) => specialPageLinksRegex.test(path);
