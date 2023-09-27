import 'ress';
import '@/app/globals.css';
import clsx from 'clsx';
import { M_PLUS_1p as fontMPlus1P } from 'next/font/google';
import type { FC, ReactNode } from 'react';
import { GoogleTagManager } from '@/shared/components/GoogleTagManager';

const rootFont = fontMPlus1P({
  weight: ['400', '500', '700'],
  subsets: ['latin', 'latin-ext'],
});

const RootLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <html lang="ja">
        <body className={clsx('text-slate-700', rootFont.className)}>
          <GoogleTagManager />

          {children}
        </body>
      </html>
    </>
  );
};

export default RootLayout;
