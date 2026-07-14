'use client';

import dynamic from 'next/dynamic';
import type { FC } from 'react';

import { Header } from '@/shared/components/Layout/Header';
import { Toaster } from '@/shared/components/ui/toaster';

const AuthWidget = dynamic(() => import('@/features/account/ui/AuthWidget').then((mod) => mod.AuthWidget), {
  ssr: false,
  loading: () => <div className="size-8" />,
});

const BlogLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-full flex-col">
      <Header account={<AuthWidget />} />
      <main>{children}</main>
      <Toaster />
    </div>
  );
};

export default BlogLayout;
