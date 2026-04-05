import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import type { FC } from 'react';

import { Button } from '@/shared/components/ui/button';
import { usePublicAnalyses } from '@/shared/lib/firebase/stores/analyses/publicAnalyses';

import { AnalysisCard } from './AnalysisCard';
import { selectedSystemAtom, sortOptionAtom } from './atoms';

const usePublicAnalysesList = () => {
  const selectedSystem = useAtomValue(selectedSystemAtom);
  const sortOption = useAtomValue(sortOptionAtom);

  const { analyses, loading, hasMore, loadMore } = usePublicAnalyses({
    systemId: selectedSystem,
    sortBy: sortOption,
    pageSize: 9,
  });

  return { analyses, loading, hasMore, loadMore };
};

export const PublicAnalysisList: FC = () => {
  const { analyses, loading, hasMore, loadMore } = usePublicAnalysesList();

  if (loading && analyses.length === 0) {
    return <div className="text-slate-500 text-sm py-8 text-center">{t('analyze-logs:list.state.loading')}</div>;
  }

  if (analyses.length === 0) {
    return <div className="text-slate-500 text-sm py-8 text-center">{t('analyze-logs:list.state.no-results')}</div>;
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {analyses.map((analysis) => (
          <AnalysisCard key={analysis.id} analysis={analysis} />
        ))}
      </div>
      {hasMore && (
        <div className="py-8 text-center">
          <Button onClick={loadMore} disabled={loading} variant="outline" size="sm">
            {loading ? t('analyze-logs:list.state.loading') : t('analyze-logs:list.load-more')}
          </Button>
        </div>
      )}
    </>
  );
};
