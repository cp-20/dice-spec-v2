'use client';

import dynamic from 'next/dynamic';
import type { FC } from 'react';

import { Skeleton } from '@/shared/components/ui/skeleton';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';

const AuthenticatedUserMenu = dynamic(
  () => import('./AuthenticatedUserMenu').then((mod) => mod.AuthenticatedUserMenu),
  { ssr: false, loading: () => <Skeleton className="size-8 rounded-full" /> },
);

export const FirebaseAuthWidget: FC = () => {
  const { authUser, loading, signOut } = useFirebaseAuth();

  if (loading) {
    return <Skeleton className="size-8 rounded-full" />;
  }

  if (!authUser) {
    return null;
  }

  return <AuthenticatedUserMenu email={authUser.email} signOut={signOut} />;
};
