'use client';

import { RotateCw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Component, type FC, type ReactNode } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { captureClientException } from '@/shared/lib/sentryClient';

const FirebaseAuthWidget = dynamic(() => import('./FirebaseAuthWidget').then((mod) => mod.FirebaseAuthWidget), {
  ssr: false,
  // vinext は読み込み失敗を loading に渡して握りつぶすため、再送出して AuthWidgetBoundary で扱う。
  loading: ({ error }) => {
    if (error) throw error;
    return <Skeleton className="size-8 rounded-full" />;
  },
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
        title="再読み込み"
        onClick={() => window.location.reload()}
      >
        <RotateCw className="size-4" aria-hidden="true" />
      </Button>
    );
  }
}

export const AuthWidget: FC = () => (
  <AuthWidgetBoundary>
    <FirebaseAuthWidget />
  </AuthWidgetBoundary>
);
