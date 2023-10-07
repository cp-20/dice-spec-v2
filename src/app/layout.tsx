import 'ress';
import '@/shared/styles/globals.css';
import clsx from 'clsx';
import type { FC, ReactNode } from 'react';
import { GoogleTagManager } from '@/shared/components/GoogleTagManager';
import { fontNotoSansJP } from '@/shared/fonts/NotoSansJP';

const RootLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <html lang="ja">
        <body
          className={clsx(
            'overflow-y-hidden text-slate-700',
            fontNotoSansJP.className,
          )}
        >
          <GoogleTagManager />

          {children}
        </body>
      </html>
    </>
  );
};

export default RootLayout;
