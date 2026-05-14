'use client';

import { t } from 'i18next';
import type { FC } from 'react';

import { GoogleLogo } from '@/shared/components/elements/GoogleIcon';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';
import { cn } from '@/shared/lib/shadcn-utils';

type GoogleSignInButtonProps = {
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
};

export const GoogleSignInButton: FC<GoogleSignInButtonProps> = ({ size = 'md', fullWidth = false }) => {
  const { loading, signInWithGoogle } = useFirebaseAuth();

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-2',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-3 text-sm gap-3',
  };

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      disabled={loading}
      className={cn(
        'flex items-center justify-center rounded-md border border-gray-300 bg-white font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50',
        sizeClasses[size],
        fullWidth && 'w-full',
      )}
    >
      <GoogleLogo />
      <span>{t('profile:google-sign-in')}</span>
    </button>
  );
};
