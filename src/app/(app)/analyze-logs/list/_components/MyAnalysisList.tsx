import { useAtomValue } from 'jotai';
import type { FC } from 'react';

import { myAnalysesLoadingAtom } from '@/features/log-analysis/firebase/userAnalyses';

import { AnalysisCard } from './AnalysisCard';
import { ALL_SYSTEM_ID, filteredAndSortedMyAnalysesAtom, selectedSystemAtom } from './atoms';

export const MyAnalysisList: FC = () => {
  const selectedSystem = useAtomValue(selectedSystemAtom);
  const analyses = useAtomValue(filteredAndSortedMyAnalysesAtom);
  const loading = useAtomValue(myAnalysesLoadingAtom);

  if (loading) {
    return <div className="text-slate-500 text-sm py-8 text-center">読み込み中...</div>;
  }

  if (analyses.length === 0) {
    return (
      <div className="text-slate-500 text-sm py-8 text-center">
        {selectedSystem !== ALL_SYSTEM_ID ? '検索結果が見つかりませんでした' : '解析結果がありません'}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {analyses.map((analysis) => (
        <AnalysisCard key={analysis.id} analysis={analysis} />
      ))}
    </div>
  );
};
