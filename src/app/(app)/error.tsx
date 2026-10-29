'use client';

import { IconExclamationCircle } from '@tabler/icons-react';
import { type FC, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { isModuleLoadFailure, reloadAfterModuleLoadFailure } from '@/shared/lib/moduleLoadRecovery';
import { SentryErrorCatch } from '@/shared/lib/SentryErrorCatch';

type Props = {
  error: Error;
  reset: () => void;
};

const ErrorPage: FC<Props> = ({ error, reset }) => {
  console.error(error);
  const [reloading, setReloading] = useState(false);

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      {isModuleLoadFailure(error) && <SentryErrorCatch error={error} />}
      <IconExclamationCircle className="size-10" />
      <p>予期せぬエラーが発生しました</p>
      <Button
        disabled={reloading}
        aria-busy={reloading}
        onClick={() => {
          if (!isModuleLoadFailure(error)) return reset();
          setReloading(true);
          void reloadAfterModuleLoadFailure();
        }}
      >
        {reloading ? '再読み込み中...' : '再読み込み'}
      </Button>
    </div>
  );
};

export default ErrorPage;
