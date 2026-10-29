'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import { reloadAfterModuleLoadFailure } from '@/shared/lib/moduleLoadRecovery';

const SentryErrorCatchDynamic = dynamic(
  () => import('@/shared/lib/SentryErrorCatch').then((mod) => mod.SentryErrorCatch),
  { ssr: false },
);

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  const [reloading, setReloading] = useState(false);
  return (
    <html lang="ja">
      <body style={{ margin: 0, color: '#334155', background: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <SentryErrorCatchDynamic error={error} />
        {/* レイアウトやCSSの取得失敗でも復旧操作を表示できるよう、共有UIやスタイルシートに依存しない。 */}
        <main
          style={{
            boxSizing: 'border-box',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 20, lineHeight: 1.5 }}>ページを読み込めませんでした</h1>
          <button
            type="button"
            // 失敗した import() はブラウザに保持されるため、Reactの再描画ではなく文書全体を読み直す。
            onClick={() => {
              setReloading(true);
              void reloadAfterModuleLoadFailure();
            }}
            disabled={reloading}
            aria-busy={reloading}
            style={{
              minHeight: 44,
              padding: '8px 16px',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              background: '#fff',
              color: 'inherit',
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            {reloading ? '再読み込み中...' : 'ページを再読み込み'}
          </button>
        </main>
      </body>
    </html>
  );
}
