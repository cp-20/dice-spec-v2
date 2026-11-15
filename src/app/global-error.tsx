'use client';

import { reloadOnceOnChunkLoadError } from '@/shared/lib/chunkLoadRecovery';
import { captureClientException } from '@/shared/lib/sentryClient';

const reported = new WeakSet<object>();

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  // モジュール束縛が壊れるとフック自体が失敗するため、復旧画面ではフックを使わない。
  if (typeof window !== 'undefined' && !reported.has(error)) {
    reported.add(error);
    if (!reloadOnceOnChunkLoadError(error)) captureClientException(error);
  }

  return (
    <html lang="ja">
      <body style={{ margin: 0, color: '#334155', background: '#fff', fontFamily: 'system-ui, sans-serif' }}>
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
            onClick={() => window.location.reload()}
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
            ページを再読み込み
          </button>
        </main>
      </body>
    </html>
  );
}
