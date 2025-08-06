import { IconDice5, IconFileExport, IconSearch, IconTimeline } from '@tabler/icons-react';

export const navLinks = [
  { href: '/expect', icon: IconSearch },
  { href: '/dice', icon: IconDice5 },
  { href: '/analyze-logs', icon: IconTimeline },
  { href: '/ccfolia', icon: IconFileExport },
] as const;

export type NavPaths = (typeof navLinks)[number]['href'];

const navLinksRegex = new RegExp(`(/en)?${navLinks.map((link) => link.href).join('|')}`);

export const isNavPath = (path: string): path is NavPaths => navLinksRegex.test(path);
