'use client';

import type { LinkProps } from 'next/link';
import { Link } from 'nextjs13-progress';
import { type ComponentProps } from 'react';

export type CustomLinkProps = LinkProps<unknown> & ComponentProps<typeof Link>;

export const CustomLink = ({ children, ...props }: CustomLinkProps) => {
  return <Link {...props}>{children}</Link>;
};
