import { IconDice5, IconFileExport, IconList, IconSearch, IconTimeline } from '@tabler/icons-react';

export const navLinks = [
  { key: 'expect', href: '/expect', icon: IconSearch, sideNavOnly: false },
  { key: 'dice', href: '/dice', icon: IconDice5, sideNavOnly: false },
  { key: 'analyze-logs', href: '/analyze-logs', icon: IconTimeline, sideNavOnly: false },
  { key: 'analysis-list', href: '/analyze-logs/list', icon: IconList, sideNavOnly: true },
  { key: 'ccfolia', href: '/ccfolia', icon: IconFileExport, sideNavOnly: false },
] as const;

export type NavPaths = (typeof navLinks)[number]['href'];

const navLinksRegex = new RegExp(`(/en)?${navLinks.map((link) => link.href).join('|')}`);

export const isNavPath = (path: string): path is NavPaths => navLinksRegex.test(path);

export const specialPageLinks = ['/profile'] as const;

export type SpecialPagePaths = (typeof specialPageLinks)[number];

const specialPageLinksRegex = new RegExp(`(/en)?${specialPageLinks.join('|')}`);

export const isSpecialPagePath = (path: string): path is SpecialPagePaths => specialPageLinksRegex.test(path);
