import { useAtomValue } from 'jotai';
import { Loader2 } from 'lucide-react';
import type { FC } from 'react';

import { ContainerSection } from '@/app/(app)/_components/ContainerSection';
import { DiceLogListView } from '@/app/(app)/analyze-logs/_components/DiceLogListView';
import { DiceLogSummaryView } from '@/app/(app)/analyze-logs/_components/DiceLogSummary';

import { canViewRecordsAtom, currentAnalysisRecordsAtom, currentAnalysisRecordsStateAtom } from './atoms';

export const AnalysisRecordsView: FC = () => {
  const canViewRecords = useAtomValue(canViewRecordsAtom);

  if (!canViewRecords) {
    return (
      <div className="space-y-4">
        <ContainerSection label="技能サマリー">
          <div className="text-sm text-slate-500">非公開になっています</div>
        </ContainerSection>

        <ContainerSection label="ダイスログ">
          <div className="text-sm text-slate-500">非公開になっています</div>
        </ContainerSection>
      </div>
    );
  }

  return <AnalysisRecordsViewMain />;
};

const AnalysisRecordsViewMain: FC = () => {
  const records = useAtomValue(currentAnalysisRecordsAtom);
  const { loading, error } = useAtomValue(currentAnalysisRecordsStateAtom);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return <div className="py-8 text-center text-red-600 text-sm">ダイスログを読み込めませんでした</div>;
  }

  return (
    <div className="space-y-4">
      <DiceLogSummaryView results={records ?? undefined} />
      <DiceLogListView results={records ?? undefined} />
    </div>
  );
};
