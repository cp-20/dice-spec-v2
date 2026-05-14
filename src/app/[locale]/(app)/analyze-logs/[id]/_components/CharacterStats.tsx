import { useAtomValue } from 'jotai';
import type { FC } from 'react';

import { LogAnalysisChartsView } from '@/app/[locale]/(app)/analyze-logs/_components/LogAnalysisChartsView';
import { LogAnalysisRankingChartView } from '@/app/[locale]/(app)/analyze-logs/_components/LogAnalysisRankingChartView';

import { LogAnalysisStatsView } from '../../_components/LogAnalysisStatsView';
import { currentAnalysisAtom, selectedCharacterResultAtom } from './atoms';

export const CharacterStats: FC = () => {
  const { analysis } = useAtomValue(currentAnalysisAtom);
  const result = useAtomValue(selectedCharacterResultAtom);

  if (result === null || analysis === null) return null;

  return (
    <div className="space-y-4 @container">
      <div className="grid grid-cols-2 gap-4 @max-md:grid-cols-1">
        <LogAnalysisStatsView result={result} />
        <LogAnalysisRankingChartView score={result.summary.deviationScore} />
      </div>
      <LogAnalysisChartsView system={analysis.systemId} records={result.summaryRecords} />
    </div>
  );
};
