'use client';

import type { LinkProps } from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Link } from 'nextjs13-progress';
import { type ComponentPropsWithoutRef, type FC, Suspense } from 'react';

export type CustomLinkProps = Omit<LinkProps<unknown>, 'href'> &
  Omit<ComponentPropsWithoutRef<'a'>, 'href'> & { href: string };

export const CustomLink: FC<CustomLinkProps> = ({ children, ...props }) => {
  return (
    // use <Suspense> for useSearchParams
    <Suspense fallback={<Link {...props}>{children}</Link>}>
      <CustomLinkInner {...props}>{children}</CustomLinkInner>
    </Suspense>
  );
};

const CustomLinkInner: FC<CustomLinkProps> = ({ children, ...props }) => {
  const searchParams = useSearchParams();
  const link = new URL(props.href, 'https://dummy-site.invalid');
  if (searchParams.get('keep-old') === 'true') {
    link.searchParams.set('keep-old', 'true');
  }

  return (
    <Link {...props} href={link.pathname + link.search}>
      {children}
    </Link>
  );
};
