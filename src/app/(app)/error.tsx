'use client';

import { IconExclamationCircle } from '@tabler/icons-react';
import type { FC } from 'react';

import { Button } from '@/shared/components/ui/button';

type Props = {
  error: Error;
  reset: () => void;
};

const ErrorPage: FC<Props> = ({ error, reset }) => {
  console.error(error);

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <IconExclamationCircle className="size-10" />
      <p>予期せぬエラーが発生しました</p>
      <Button onClick={reset}>再読み込み</Button>
    </div>
  );
};

export default ErrorPage;
