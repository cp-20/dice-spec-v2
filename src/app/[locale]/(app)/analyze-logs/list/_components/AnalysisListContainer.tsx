'use client';

import { t } from 'i18next';
import { useAtom } from 'jotai';
import type { FC } from 'react';
import { GoogleSignInAgreement } from '@/shared/components/elements/GoogleSignInAgreement';
import { GoogleSignInButton } from '@/shared/components/elements/GoogleSignInButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';
import { AnalysisFilters } from './AnalysisFilters';
import { activeTabAtom } from './atoms';
import { MyAnalysisList } from './MyAnalysisList';
import { PublicAnalysisList } from './PublicAnalysisList';

export const AnalysisListContainer: FC = () => {
  const { authUser } = useFirebaseAuth();

  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  if (!authUser) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="text-slate-500 text-sm text-center">{t('analyze-logs:list.sign-in-required')}</div>
        <div className="flex flex-col gap-2 items-center">
          <GoogleSignInButton />
          <GoogleSignInAgreement />
        </div>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="mine" disabled={!authUser}>
          {t('analyze-logs:list.tab-mine')}
        </TabsTrigger>
        <TabsTrigger value="public">{t('analyze-logs:list.tab-public')}</TabsTrigger>
      </TabsList>

      <div className="mt-6 space-y-4">
        <AnalysisFilters />

        <TabsContent value="mine" className="mt-0">
          <MyAnalysisList />
        </TabsContent>

        <TabsContent value="public" className="mt-0">
          <PublicAnalysisList />
        </TabsContent>
      </div>
    </Tabs>
  );
};
