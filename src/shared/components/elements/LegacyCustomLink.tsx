'use client';

import { useSearchParams } from 'next/navigation';
import type { FC } from 'react';

import type { CustomLinkProps } from './CustomLink';
import { ProgressLink } from './NavigationProgress';

export const LegacyCustomLink: FC<CustomLinkProps> = ({ href, ...props }) => {
  const searchParams = useSearchParams();
  const destination = new URL(href, window.location.origin);

  if (searchParams.get('keep-old') === 'true' && destination.origin === window.location.origin) {
    destination.searchParams.set('keep-old', 'true');
  }

  const destinationHref =
    destination.origin === window.location.origin
      ? `${destination.pathname}${destination.search}${destination.hash}`
      : destination.href;
  return <ProgressLink {...props} href={destinationHref} />;
};
