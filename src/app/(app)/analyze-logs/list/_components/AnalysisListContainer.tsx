'use client';

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
        <div className="text-slate-500 text-sm text-center">この機能を利用するにはログインが必要です</div>
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
          自分の解析結果
        </TabsTrigger>
        <TabsTrigger value="public">公開されている解析結果</TabsTrigger>
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
