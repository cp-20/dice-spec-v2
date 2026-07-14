import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import { Loader2 } from 'lucide-react';
import type { FC } from 'react';

import { ContainerSection } from '@/app/[locale]/(app)/_components/ContainerSection';
import { DiceLogListView } from '@/app/[locale]/(app)/analyze-logs/_components/DiceLogListView';
import { DiceLogSummaryView } from '@/app/[locale]/(app)/analyze-logs/_components/DiceLogSummary';

import { canViewRecordsAtom, currentAnalysisRecordsAtom, currentAnalysisRecordsStateAtom } from './atoms';

export const AnalysisRecordsView: FC = () => {
  const canViewRecords = useAtomValue(canViewRecordsAtom);

  if (!canViewRecords) {
    return (
      <div className="space-y-4">
        <ContainerSection label={t('analyze-logs:skill-summary.label')}>
          <div className="text-sm text-slate-500">{t('analyze-logs:detail.records-owner-only')}</div>
        </ContainerSection>

        <ContainerSection label={t('analyze-logs:log')}>
          <div className="text-sm text-slate-500">{t('analyze-logs:detail.records-owner-only')}</div>
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
    return <div className="py-8 text-center text-red-600 text-sm">{t('analyze-logs:detail.records-load-failed')}</div>;
  }

  return (
    <div className="space-y-4">
      <DiceLogSummaryView results={records ?? undefined} />
      <DiceLogListView results={records ?? undefined} />
    </div>
  );
};
