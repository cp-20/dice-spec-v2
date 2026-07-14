'use client';

import { lazy, type FC, Suspense } from 'react';

import { isOldApp } from '@/shared/lib/const';

import { ProgressLink, type ProgressLinkProps } from './NavigationProgress';

export type CustomLinkProps = Omit<ProgressLinkProps, 'href'> & { href: string };

const LegacyCustomLink = lazy(() => import('./LegacyCustomLink').then((mod) => ({ default: mod.LegacyCustomLink })));

export const CustomLink: FC<CustomLinkProps> = (props) =>
  isOldApp ? (
    <Suspense fallback={<ProgressLink {...props} />}>
      <LegacyCustomLink {...props} />
    </Suspense>
  ) : (
    <ProgressLink {...props} />
  );
