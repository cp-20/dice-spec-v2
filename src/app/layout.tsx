import 'ress';
import '@/app/globals.css';
import type { FC, ReactNode } from 'react';
import { GoogleTagManager } from '@/shared/components/GoogleTagManager';

const RootLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <html lang="ja">
        <body>
          <GoogleTagManager />

          {children}
        </body>
      </html>
    </>
  );
};

export default RootLayout;
