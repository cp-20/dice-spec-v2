import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import type { FC } from 'react';
import { ContainerSection } from '@/app/[locale]/(app)/_components/ContainerSection';
import { DiceLogListView } from '@/app/[locale]/(app)/analyze-logs/_components/DiceLogListView';
import { DiceLogSummaryView } from '@/app/[locale]/(app)/analyze-logs/_components/DiceLogSummary';
import { canViewRecordsAtom, currentAnalysisRecordsAtom } from './atoms';

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

  return (
    <div className="space-y-4">
      <DiceLogSummaryView results={records ?? undefined} />
      <DiceLogListView results={records ?? undefined} />
    </div>
  );
};
