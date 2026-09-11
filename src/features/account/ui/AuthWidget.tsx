'use client';

import { t } from 'i18next';
import { RotateCw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Component, type FC, type ReactNode, useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { scheduleIdleTask } from '@/shared/lib/scheduleIdleTask';
import { captureClientException } from '@/shared/lib/sentryClient';

const FirebaseAuthWidget = dynamic(() => import('./FirebaseAuthWidget').then((mod) => mod.FirebaseAuthWidget), {
  ssr: false,
  loading: () => <div className="size-8" />,
});

// 認証UIの遅延チャンク取得が失敗しても、オフラインで使える本文を破棄しない。
class AuthWidgetBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    captureClientException(error);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    // 失敗したチャンクはランタイムに保持されるため、復旧はユーザーによる再読み込みで行う。
    return (
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        title={t('common:error.reload')}
        onClick={() => window.location.reload()}
      >
        <RotateCw className="size-4" aria-hidden="true" />
      </Button>
    );
  }
}

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
    <AuthWidgetBoundary>
      <FirebaseAuthWidget />
    </AuthWidgetBoundary>
  ) : (
    <div className="size-8" onPointerEnter={() => setReady(true)} onTouchStart={() => setReady(true)} />
  );
};
