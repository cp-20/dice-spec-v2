'use client';

import { Button } from '@/shared/components/ui/button';
import { IconExclamationCircle } from '@tabler/icons-react';
import { t } from 'i18next';
import type { FC } from 'react';

type Props = {
  error: Error;
  reset: () => void;
};

const ErrorPage: FC<Props> = ({ error, reset }) => {
  console.error(error);

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <IconExclamationCircle className="size-10" />
      <p>{t('common:error.message')}</p>
      <Button onClick={reset}>{t('common:error.reload')}</Button>
    </div>
  );
};

export default ErrorPage;
