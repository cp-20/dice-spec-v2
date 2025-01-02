'use client';

import { IconBrandX, IconLoader } from '@tabler/icons-react';
import type { Plugin } from 'chart.js';
import merge from 'deepmerge';
import { t } from 'i18next';
import dynamic from 'next/dynamic';
import { type FC, useEffect } from 'react';
import { useCharacterLogAnalysis } from './hooks/useCharacterLogAnalysis';
import { useCharacterSelect } from './hooks/useCharacterSelect';
import { useChartImageShare } from './hooks/useChartImageShare';
import { Button } from '@/shared/components/ui/button';
import { commonChartOption } from '@/shared/lib/commonChartOption';
import { groupBy } from '@/shared/lib/groupBy';
import { aggregateResults } from '@/app/[locale]/(app)/analyze-logs/_components/hooks/ccfoliaLogAnalysis/resultAggregator';
import { useLogAnalysisSystem } from '@/app/[locale]/(app)/analyze-logs/_components/hooks/useLogAnalysis';

const customCanvasBackgroundColorPlugin: Plugin = {
  id: 'customCanvasBackgroundColor',
  beforeDraw: (chart, args, options) => {
    const { ctx } = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = (options.color as string) || '#ffffff';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

const Bar = dynamic(async () => (await import('react-chartjs-2')).Bar, {
  ssr: false,
});

export const LogAnalysisCharts: FC = () => {
  const { system } = useLogAnalysisSystem();
  const { chartRef, isSharingInProgress, shareImage } = useChartImageShare();
  const { character } = useCharacterSelect();
  const analysisResult = useCharacterLogAnalysis(character);

  useEffect(() => {
    import('chart.js').then(({ Chart, BarController, CategoryScale, LinearScale, BarElement }) => {
      Chart.register(BarController, CategoryScale, LinearScale, BarElement, customCanvasBackgroundColorPlugin);
    });
  }, []);

  if (analysisResult === undefined) return null;
  if (system === null) return null;

  const { labels: aggregatedResultLabels, data: aggregatedResultData } = aggregateResults(
    analysisResult.results,
    system,
  );

  const evaluations = analysisResult.results.map(({ evaluation }) => evaluation);
  const aggregatedEvaluations = Object.entries(groupBy(evaluations, (result) => result))
    .map(([result, results]) => [result, results ? results.length : 0] as const)
    .toSorted(([, a], [, b]) => b - a);

  const aggregatedEvaluationLabels = aggregatedEvaluations.map(([label]) => label);
  const aggregatedEvaluationData = aggregatedEvaluations.map(([, value]) => value);

  return (
    <div className="space-y-4 @container">
      <Button variant="secondary" className="w-full" onClick={shareImage} disabled={isSharingInProgress}>
        {isSharingInProgress ? (
          <div className="animate-slide-in-top" key="sharing-in-progress">
            <IconLoader className="animate-spin" />
          </div>
        ) : (
          <div className="flex animate-slide-in-top gap-2" key="share-button">
            <IconBrandX />
            <span>{t('analyze-logs:stats.share')}</span>
          </div>
        )}
      </Button>
      <div className="flex flex-col gap-8 @xl:flex-row">
        <div className="fixed left-full">
          <Bar
            data={{
              labels: aggregatedResultLabels,
              datasets: [
                {
                  data: aggregatedResultData,
                  backgroundColor: 'rgba(100, 116, 139, 0.5)',
                  yAxisID: 'y',
                },
              ],
            }}
            height={630}
            width={1200}
            options={merge(commonChartOption, {
              scales: {
                x: { ticks: { font: { size: 30 } } },
                y: { ticks: { font: { size: 30 } } },
              },
              layout: {
                padding: 32,
              },
            } as const)}
            ref={chartRef}
          />
        </div>
        <div className="min-w-0 flex-1">
          <Bar
            data={{
              labels: aggregatedResultLabels,
              datasets: [
                {
                  data: aggregatedResultData,
                  backgroundColor: 'rgba(100, 116, 139, 0.5)',
                  yAxisID: 'y',
                },
              ],
            }}
            height={300}
            options={commonChartOption}
          />
        </div>
        <div className="min-w-0 flex-1">
          <Bar
            data={{
              labels: aggregatedEvaluationLabels,
              datasets: [
                {
                  data: aggregatedEvaluationData,
                  backgroundColor: 'rgba(100, 116, 139, 0.5)',
                },
              ],
            }}
            height={300}
            options={merge(commonChartOption, {
              indexAxis: 'y',
            } as const)}
          />
        </div>
      </div>
    </div>
  );
};
