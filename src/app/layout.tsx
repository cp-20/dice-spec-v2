import 'ress';
import '@/shared/styles/globals.css';
import clsx from 'clsx';
import type { FC, ReactNode } from 'react';
import { GoogleTagManager } from '@/shared/components/GoogleTagManager';
import { WebVitals } from '@/shared/components/elements/WebVitals';
import { fontNotoSansJP } from '@/shared/fonts/NotoSansJP';

const RootLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <html lang="ja">
        <body className={clsx('text-slate-700', fontNotoSansJP.className)}>
          <GoogleTagManager />
          <WebVitals />

          {children}
        </body>
      </html>
    </>
  );
};

export default RootLayout;
