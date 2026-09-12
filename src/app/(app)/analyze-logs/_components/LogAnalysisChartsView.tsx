'use client';

import type { ChartOptions, Plugin } from 'chart.js';
import merge from 'deepmerge';
import dynamic from 'next/dynamic';
import { type FC, useEffect, useState } from 'react';

import { systemStats as allSystemStats } from '@/features/log-analysis/ccfolia/messageParser';
import { aggregateResults } from '@/features/log-analysis/ccfolia/resultAggregator';
import type { MessageParserResult, System } from '@/features/log-analysis/model';
import { commonChartOption } from '@/shared/lib/commonChartOption';
import { groupBy } from '@/shared/lib/groupBy';

const Bar = dynamic(async () => (await import('react-chartjs-2')).Bar, { ssr: false });

const customCanvasBackgroundColorPlugin: Plugin = {
  id: 'customCanvasBackgroundColor',
  beforeDraw: (chart, _args, options) => {
    const { ctx } = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = (options.color as string) || '#ffffff';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

interface LogAnalysisChartsViewProps {
  system: System;
  records: MessageParserResult[];
}

export const LogAnalysisChartsView: FC<LogAnalysisChartsViewProps> = ({ system, records }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    import('chart.js').then(({ Chart, BarController, CategoryScale, LinearScale, BarElement }) => {
      Chart.register(BarController, CategoryScale, LinearScale, BarElement, customCanvasBackgroundColorPlugin);
      setLoaded(true);
    });
  }, []);

  const systemStats = allSystemStats[system];
  const { labels: resultLabels, data: resultDataset } = aggregateResults(records, system);

  const systemEvaluations = systemStats.evaluations.map(({ label }) => label);
  const evaluations = records.map(({ evaluation }) => evaluation);
  const aggregatedEvaluations = Object.entries(groupBy(evaluations, (result) => result)).map(
    ([result, results]) => [result, results ? results.length : 0] as const,
  );
  const sortedEvaluations = systemEvaluations.map(
    (label) => aggregatedEvaluations.find(([aggLabel]) => aggLabel === label) ?? ([label, 0] as const),
  );

  const evaluationLabels = sortedEvaluations.map(([label]) => label);
  const evaluationDataset = sortedEvaluations.map(([, value]) => value);

  return (
    <div className="space-y-4 @container">
      {loaded ? (
        <Chart
          resultLabels={resultLabels}
          resultDataset={resultDataset}
          evaluationLabels={evaluationLabels}
          evaluationDataset={evaluationDataset}
        />
      ) : (
        <div className="h-75" />
      )}
    </div>
  );
};

interface ChartProps {
  resultLabels: string[];
  resultDataset: number[];
  evaluationLabels: string[];
  evaluationDataset: number[];
}

const evaluationChartAdditionalOption: ChartOptions<'bar'> = {
  indexAxis: 'y',
};
const evaluationChartOption = merge(commonChartOption, evaluationChartAdditionalOption);

const Chart: FC<ChartProps> = ({ resultLabels, resultDataset, evaluationLabels, evaluationDataset }) => {
  return (
    <div className="flex flex-col gap-8 @xl:flex-row">
      <div className="min-w-0 flex-1">
        <Bar
          data={{
            labels: resultLabels,
            datasets: [
              {
                data: resultDataset,
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
            labels: evaluationLabels,
            datasets: [
              {
                data: evaluationDataset,
                backgroundColor: 'rgba(100, 116, 139, 0.5)',
              },
            ],
          }}
          height={300}
          options={evaluationChartOption}
        />
      </div>
    </div>
  );
};
