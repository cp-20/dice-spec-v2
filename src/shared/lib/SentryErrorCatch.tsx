'use client';

import { type FC, useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
}

export const SentryErrorCatch: FC<Props> = ({ error }) => {
  useEffect(() => {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.captureException(error);
    });
  }, [error]);

  return null;
};
