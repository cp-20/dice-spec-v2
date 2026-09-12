'use client';

import { IconFileOff, IconLoader2 } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import type { FC } from 'react';

import { ContainerSection } from '@/app/(app)/_components/ContainerSection';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import { GoogleSignInAgreement } from '@/shared/components/elements/GoogleSignInAgreement';
import { GoogleSignInButton } from '@/shared/components/elements/GoogleSignInButton';
import { Button } from '@/shared/components/ui/button';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';

import { AnalysisHeader } from './AnalysisHeader';
import { AnalysisRecordsView } from './AnalysisLogView';
import { currentAnalysisAtom, useAnalysisIdSync } from './atoms';
import { CharacterSelector } from './CharacterSelector';
import { CharacterStats } from './CharacterStats';

const AnalyzeLogDetailPageClient: FC = () => {
  useAnalysisIdSync();
  const { analysis, loading, error } = useAtomValue(currentAnalysisAtom);
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

  if (error) {
    return (
      <ContainerSection>
        <div className="py-12 text-center text-red-600">解析結果を読み込めませんでした</div>
      </ContainerSection>
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
              <p className="text-lg font-medium text-slate-700">この解析は見つかりませんでした</p>
              <p className="text-sm text-slate-500">指定された解析が存在しないか、削除された可能性があります</p>
            </div>
            <Button asChild variant="outline">
              <CustomLink href="/analyze-logs/list">解析一覧に戻る</CustomLink>
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
            <div className="text-sm text-slate-600">この解析は非公開です</div>
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

export default AnalyzeLogDetailPageClient;
