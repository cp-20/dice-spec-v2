'use client';

import type { FC } from 'react';
import { Header } from '@/shared/components/Layout/Header';
import { Toaster } from '@/shared/components/ui/toaster';

const BlogLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main>{children}</main>
      <Toaster />
    </div>
  );
};

export default BlogLayout;
