'use client';

import { IconFileOff, IconLoader2 } from '@tabler/icons-react';
import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import type { FC } from 'react';
import { ContainerSection } from '@/app/[locale]/(app)/_components/ContainerSection';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import { GoogleSignInAgreement } from '@/shared/components/elements/GoogleSignInAgreement';
import { GoogleSignInButton } from '@/shared/components/elements/GoogleSignInButton';
import { Button } from '@/shared/components/ui/button';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';
import { AnalysisHeader } from './_components/AnalysisHeader';
import { AnalysisRecordsView } from './_components/AnalysisLogView';
import { currentAnalysisAtom, useAnalysisIdSync } from './_components/atoms';
import { CharacterSelector } from './_components/CharacterSelector';
import { CharacterStats } from './_components/CharacterStats';

const AnalyzeLogDetailPage: FC = () => {
  useAnalysisIdSync();
  const { analysis, loading } = useAtomValue(currentAnalysisAtom);
  const { authUser } = useFirebaseAuth();

  if (loading) {
    return (
      <div className="space-y-8">
        <AnalysisHeader />
        <div className="flex items-center justify-center py-12">
          <IconLoader2 className="size-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  // ログが見つからない or アクセス権限がない場合
  if (analysis === null) {
    return (
      <div className="space-y-8">
        <ContainerSection>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <IconFileOff className="size-12 text-slate-400" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-slate-700">{t('analyze-logs:detail.not-found')}</p>
              <p className="text-sm text-slate-500">{t('analyze-logs:detail.not-found-description')}</p>
            </div>
            <Button asChild variant="outline">
              <CustomLink href="/analyze-logs/list">{t('analyze-logs:detail.back-to-list')}</CustomLink>
            </Button>
          </div>
        </ContainerSection>
      </div>
    );
  }

  const isOwner = authUser?.uid === analysis.ownerUid;
  const canViewSummary = analysis.visibilityLevel !== 'private' || isOwner;

  if (!canViewSummary) {
    return (
      <div className="space-y-8">
        <AnalysisHeader />
        <ContainerSection>
          <div className="space-y-3">
            <div className="text-sm text-slate-600">{t('analyze-logs:detail.private')}</div>
            <div className="flex flex-col gap-2 items-center">
              <GoogleSignInButton size="md" />
              <GoogleSignInAgreement />
            </div>
          </div>
        </ContainerSection>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AnalysisHeader />
      <CharacterSelector />
      <CharacterStats />
      <AnalysisRecordsView />
    </div>
  );
};

// ページ全体が 'use client' されているので wrapPage しない
export default AnalyzeLogDetailPage;
