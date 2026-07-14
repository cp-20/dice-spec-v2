'use client';

import { type FC, useEffect } from 'react';

import { captureClientException } from './sentryClient';

interface Props {
  error: Error & { digest?: string };
}

export const SentryErrorCatch: FC<Props> = ({ error }) => {
  useEffect(() => {
    captureClientException(error);
  }, [error]);

  return null;
};
