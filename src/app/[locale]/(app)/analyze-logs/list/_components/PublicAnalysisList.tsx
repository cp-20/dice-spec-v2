import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import { useEffect, useState, type FC } from 'react';

import { Button } from '@/shared/components/ui/button';
import { usePublicAnalyses } from '@/shared/lib/firebase/stores/analyses/publicAnalyses';

import { AnalysisCard } from './AnalysisCard';
import { selectedSystemAtom, sortOptionAtom } from './atoms';

const usePublicAnalysesList = () => {
  const selectedSystem = useAtomValue(selectedSystemAtom);
  const sortOption = useAtomValue(sortOptionAtom);

  const { analyses, loading, hasMore, error, loadMore, retry } = usePublicAnalyses({
    systemId: selectedSystem,
    sortBy: sortOption,
    pageSize: 9,
  });

  return { analyses, loading, hasMore, error, loadMore, retry };
};

export const PublicAnalysisList: FC = () => {
  const { analyses, loading, hasMore, error, loadMore, retry } = usePublicAnalysesList();
  const [lastSettledState, setLastSettledState] = useState<{
    analyses: typeof analyses;
    hasMore: boolean;
  } | null>(null);

  useEffect(() => {
    if (!loading) {
      setLastSettledState({ analyses, hasMore });
    }
  }, [analyses, hasMore, loading]);

  const showReloadOverlay =
    loading && analyses.length === 0 && (lastSettledState !== null ? lastSettledState.analyses.length > 0 : false);
  const visibleAnalyses = showReloadOverlay && lastSettledState ? lastSettledState.analyses : analyses;
  const visibleHasMore = showReloadOverlay && lastSettledState ? lastSettledState.hasMore : hasMore;

  if (loading && visibleAnalyses.length === 0) {
    return <div className="text-slate-500 text-sm py-8 text-center">{t('analyze-logs:list.state.loading')}</div>;
  }

  if (error && visibleAnalyses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="text-red-600 text-sm">{t('analyze-logs:list.state.failed')}</div>
        <Button onClick={retry} variant="outline" size="sm">
          {t('analyze-logs:list.retry')}
        </Button>
      </div>
    );
  }

  if (visibleAnalyses.length === 0) {
    return <div className="text-slate-500 text-sm py-8 text-center">{t('analyze-logs:list.state.no-results')}</div>;
  }

  return (
    <div className="relative">
      <div className="flex flex-col gap-2">
        {visibleAnalyses.map((analysis) => (
          <AnalysisCard key={analysis.id} analysis={analysis} />
        ))}
      </div>
      {visibleHasMore && (
        <div className="py-8 text-center">
          <Button onClick={loadMore} disabled={loading} variant="outline" size="sm">
            {loading ? t('analyze-logs:list.state.loading') : t('analyze-logs:list.load-more')}
          </Button>
        </div>
      )}
      {showReloadOverlay && (
        <div className="absolute inset-0 z-10 grid place-content-center rounded-md bg-white/70 backdrop-blur-[1px]">
          <span className="text-slate-600 text-sm font-medium">{t('analyze-logs:list.state.loading')}</span>
        </div>
      )}
    </div>
  );
};
