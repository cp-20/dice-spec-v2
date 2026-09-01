'use client';

import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import type { FC } from 'react';

import { useMeStore } from '@/features/account/firebase/accountStore';
import { GoogleSignInAgreement } from '@/shared/components/elements/GoogleSignInAgreement';
import { GoogleSignInButton } from '@/shared/components/elements/GoogleSignInButton';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { authUserAtom, authUserLoadingAtom } from '@/shared/lib/firebase/useFirebaseAuth';

import { CcfoliaSavedCharactersContent } from './CcfoliaSavedCharactersContent';

const HEADING_ID = 'saved-characters-heading';

const CharacterGridSkeleton: FC = () => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 3 }, (_, index) => (
      <Skeleton key={index} className="h-32 w-full rounded-lg" />
    ))}
  </div>
);

export const CcfoliaSavedCharacters: FC = () => {
  const uid = useAtomValue(authUserAtom)?.uid ?? null;
  const authLoading = useAtomValue(authUserLoadingAtom);
  const { meLoading: accountLoading } = useMeStore();

  return (
    <section className="space-y-4" aria-labelledby={HEADING_ID}>
      <h2 id={HEADING_ID} className="text-base font-semibold">
        {t('ccfolia:saved.title')}
      </h2>
      {authLoading || Boolean(uid && accountLoading) ? (
        <CharacterGridSkeleton />
      ) : !uid ? (
        <div className="flex flex-col items-center justify-center gap-4 py-6">
          <p className="text-center text-sm text-muted-foreground">{t('ccfolia:saved.sign-in-required')}</p>
          <div className="flex flex-col items-center gap-2">
            <GoogleSignInButton size="md" />
            <GoogleSignInAgreement />
          </div>
        </div>
      ) : (
        <CcfoliaSavedCharactersContent />
      )}
    </section>
  );
};
