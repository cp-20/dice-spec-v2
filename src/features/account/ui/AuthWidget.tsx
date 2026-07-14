'use client';

import dynamic from 'next/dynamic';
import { type FC, useEffect, useState } from 'react';

import { scheduleIdleTask } from '@/shared/lib/scheduleIdleTask';

const FirebaseAuthWidget = dynamic(() => import('./FirebaseAuthWidget').then((mod) => mod.FirebaseAuthWidget), {
  ssr: false,
  loading: () => <div className="size-8" />,
});

export const AuthWidget: FC = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancel: (() => void) | undefined;
    const schedule = () => {
      cancel = scheduleIdleTask(() => setReady(true), 8_000, 8_000);
    };
    if (document.readyState === 'complete') {
      schedule();
      return () => cancel?.();
    }

    window.addEventListener('load', schedule, { once: true });
    return () => {
      window.removeEventListener('load', schedule);
      cancel?.();
    };
  }, []);

  return ready ? (
    <FirebaseAuthWidget />
  ) : (
    <div className="size-8" onPointerEnter={() => setReady(true)} onTouchStart={() => setReady(true)} />
  );
};
