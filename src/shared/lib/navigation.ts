import { IconDice5, IconFileExport, IconList, IconSearch, IconTimeline } from '@tabler/icons-react';

export const navLinks = [
  { label: 'ダイス予測', href: '/expect', icon: IconSearch, sideNavOnly: false },
  { label: 'ダイスロール', href: '/dice', icon: IconDice5, sideNavOnly: false },
  { label: 'ログ解析', href: '/analyze-logs', icon: IconTimeline, sideNavOnly: false },
  { label: '解析一覧', href: '/analyze-logs/list', icon: IconList, sideNavOnly: true },
  { label: 'ココフォリア出力', href: '/ccfolia', icon: IconFileExport, sideNavOnly: false },
] as const;

export const normalizePathname = (pathname: string): string => {
  return pathname.replace(/\/$/, '');
};

export type NavPaths = (typeof navLinks)[number]['href'];

const navLinksRegex = new RegExp(`^(${navLinks.map((link) => link.href).join('|')})$`);

export const isNavPath = (path: string): path is NavPaths => navLinksRegex.test(path);

const specialPageLinks = ['/profile', '/analyze-logs/[a-zA-Z0-9]+'] as const;

const specialPageLinksRegex = new RegExp(`^(${specialPageLinks.join('|')})$`);

export const isSpecialPagePath = (path: string) => specialPageLinksRegex.test(path);
