import type { FC, ReactNode } from 'react';

import { CustomLink } from '@/shared/components/elements/CustomLink';
import { cn } from '@/shared/lib/shadcn-utils';

type BaseProps = {
  children: ReactNode;
  className?: string;
};

export const H1: FC<BaseProps> = ({ children, className }) => (
  <h1 className={cn('text-3xl font-bold text-slate-900', className)}>{children}</h1>
);

export const Section: FC<BaseProps> = ({ children, className }) => (
  <section className={cn('space-y-3', className)}>{children}</section>
);

export const H2: FC<BaseProps> = ({ children, className }) => (
  <h2 className={cn('text-lg font-semibold text-slate-900', className)}>{children}</h2>
);

export const P: FC<BaseProps> = ({ children, className }) => (
  <p className={cn('leading-7 text-slate-700', className)}>{children}</p>
);

export const Ul: FC<BaseProps> = ({ children, className }) => (
  <ul className={cn('list-disc space-y-1 pl-6 leading-7 text-slate-700', className)}>{children}</ul>
);

export const Li: FC<BaseProps> = ({ children, className }) => (
  <li className={cn('leading-7 text-slate-700', className)}>{children}</li>
);

export const Link: FC<{ href: string; children: ReactNode; className?: string }> = ({ href, children, className }) => (
  <CustomLink href={href} className={cn('underline', className)}>
    {children}
  </CustomLink>
);
