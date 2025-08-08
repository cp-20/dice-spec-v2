'use client';

import { usePathname } from 'next/navigation';
import type { FC, ReactNode } from 'react';
import { BottomNavigation } from '@/shared/components/Layout/BottomNavigation';
import { Footer } from '@/shared/components/Layout/Footer';
import { Header } from '@/shared/components/Layout/Header';
import { SideNavigation } from '@/shared/components/Layout/SideNavigation';
import { Toaster } from '@/shared/components/ui/toaster';
import { isNavPath } from '@/shared/lib/navigation';

type AppLayout = {
  children?: ReactNode;
};

const AppLayout: FC<AppLayout> = ({ children }) => {
  const pathname = usePathname();

  if (!isNavPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex min-h-0 flex-1">
        <SideNavigation
          active={pathname}
          className="h-full max-md:w-fit max-sm:hidden"
          textProps={{ className: 'max-md:hidden' }}
        />
        <div className="flex h-full flex-1 flex-col overflow-y-auto">
          <main className="flex-1 p-8 max-sm:px-4">{children}</main>
          <Footer className="max-sm:hidden" />
        </div>
      </div>
      <BottomNavigation className="sm:hidden" active={pathname} />

      <Toaster />
    </div>
  );
};

export default AppLayout;
