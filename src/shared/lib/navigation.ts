import {
  IconSearch,
  IconDice5,
  IconTimeline,
  IconFileExport,
} from '@tabler/icons-react';

export const navLinks = [
  { href: '/expect', icon: IconSearch, name: 'ダイス予測' },
  { href: '/dice', icon: IconDice5, name: 'ダイスロール' },
  { href: '/analyze-logs', icon: IconTimeline, name: 'ログ解析' },
  { href: '/ccfolia', icon: IconFileExport, name: 'ココフォリア出力' },
] as const;

export type NavPaths = (typeof navLinks)[number]['href'];

export const isNavPath = (path: string): path is NavPaths =>
  navLinks.map((link) => link.href).includes(path as NavPaths);
