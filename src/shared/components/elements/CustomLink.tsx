'use client';

import type { LinkProps } from 'next/link';
import { Link } from 'nextjs13-progress';
import type { ComponentPropsWithoutRef, FC } from 'react';

export type CustomLinkProps = LinkProps<unknown> & ComponentPropsWithoutRef<'a'>;

export const CustomLink: FC<CustomLinkProps> = ({ children, ...props }) => {
  return <Link {...props}>{children}</Link>;
};
