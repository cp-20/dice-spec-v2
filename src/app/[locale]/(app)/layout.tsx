'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import type { FC, ReactNode } from 'react';

import { BottomNavigation } from '@/shared/components/Layout/BottomNavigation';
import { Footer } from '@/shared/components/Layout/Footer';
import { Header } from '@/shared/components/Layout/Header';
import { SideNavigation } from '@/shared/components/Layout/SideNavigation';
import { Toaster } from '@/shared/components/ui/toaster';
import { normalizePathname, isNavPath, isSpecialPagePath } from '@/shared/lib/navigation';

const AuthWidget = dynamic(() => import('@/features/account/ui/AuthWidget').then((mod) => mod.AuthWidget), {
  ssr: false,
  loading: () => <div className="size-8" />,
});

type AppLayout = {
  children?: ReactNode;
};

const AppLayout: FC<AppLayout> = ({ children }) => {
  const pathname = usePathname();
  const normalized = normalizePathname(pathname);

  if (!isNavPath(normalized) && !isSpecialPagePath(normalized)) {
    return <>{children}</>;
  }

  const active = isNavPath(normalized) ? normalized : null;

  return (
    <div className="flex h-full flex-col">
      <Header account={<AuthWidget />} />
      <div className="flex min-h-0 flex-1">
        <SideNavigation active={active} className="h-full max-md:w-fit max-md:hidden" />
        <div className="overflow-y-auto flex-1 h-full">
          <div className="flex h-full flex-col">
            <main className="flex-1 p-8 max-sm:px-4 w-full max-w-6xl mx-auto">{children}</main>
            <Footer className="max-sm:hidden" />
          </div>
        </div>
      </div>
      <BottomNavigation className="md:hidden" active={active} />

      <Toaster />
    </div>
  );
};

export default AppLayout;
