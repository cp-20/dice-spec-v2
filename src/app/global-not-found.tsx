/* oxlint-disable next/no-html-link-for-pages -- 通常のレイアウトを通らない復帰画面ではクライアントルーターに依存しない。 */
import type { Metadata } from 'next';

import '@/shared/styles/globals.css';

export const metadata: Metadata = {
  title: '404 | DiceSpec',
  description: '指定されたページが見つかりません。',
};

export default function GlobalNotFound() {
  return (
    <html lang="ja">
      <body className="flex min-h-dvh items-center justify-center p-6 font-(family-name:--font-main) text-slate-700">
        <main className="w-full max-w-xl space-y-6 text-center">
          <p className="text-sm text-muted-foreground">404</p>
          <h1 className="text-2xl font-bold">ページが見つかりません</h1>
          <div className="space-y-2">
            <p>指定されたページは存在しないか、移動または削除された可能性があります。</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <a className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 hover:bg-accent" href="/">
              トップへ
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
