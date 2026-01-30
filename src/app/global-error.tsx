'use client';

import dynamic from 'next/dynamic';
import NextError from 'next/error';

const SentryErrorCatchDynamic = dynamic(
  () => import('@/shared/lib/SentryErrorCatch').then((mod) => mod.SentryErrorCatch),
  { ssr: false },
);

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <>
      <SentryErrorCatchDynamic error={error} />
      <html lang="ja">
        <body>
          {/* `NextError` is the default Next.js error page component. Its type
               definition requires a `statusCode` prop. However, since the App Router
               does not expose status codes for errors, we simply pass 0 to render a
               generic error message. */}
          <NextError statusCode={0} />
        </body>
      </html>
    </>
  );
}
