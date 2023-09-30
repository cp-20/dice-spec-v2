import 'ress';
import '@/shared/styles/globals.css';
import clsx from 'clsx';
import type { FC, ReactNode } from 'react';
import { GoogleTagManager } from '@/shared/components/GoogleTagManager';
import { fontMPlus1p } from '@/shared/fonts/MPlus1p';

const RootLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <html lang="ja">
        <body className={clsx('text-slate-700', fontMPlus1p.className)}>
          <GoogleTagManager />

          {children}
        </body>
      </html>
    </>
  );
};

export default RootLayout;
