'use client';

import { barX, barY } from '@tanstack/charts/bar';
import { Chart } from '@tanstack/charts/react';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { defineChart } from '@tanstack/charts/scene';
import { type FC, useMemo } from 'react';

import { systemStats as allSystemStats } from '@/features/log-analysis/ccfolia/messageParser';
import { aggregateResults } from '@/features/log-analysis/ccfolia/resultAggregator';
import type { MessageParserResult, System } from '@/features/log-analysis/model';
import { commonChartAxis, commonChartOption } from '@/shared/lib/commonChartOption';
import { groupBy } from '@/shared/lib/groupBy';

interface LogAnalysisChartsViewProps {
  system: System | null;
  records: MessageParserResult[];
}

export const LogAnalysisChartsView: FC<LogAnalysisChartsViewProps> = ({ system, records }) => {
  const { resultChart, evaluationChart } = useMemo(() => {
    const { labels, data } = system === null ? { labels: [], data: [] } : aggregateResults(records, system);
    const resultRows = labels.map((label, index) => ({ label, count: data[index] }));
    const evaluations = groupBy(records, ({ evaluation }) => evaluation);
    const evaluationRows = (system === null ? [] : allSystemStats[system].evaluations).map(({ label }) => ({
      label,
      count: evaluations[label]?.length ?? 0,
    }));

    return {
      resultChart: defineChart({
        ...commonChartOption,
        marks: [barY(resultRows, { x: 'label', y: 'count', fill: 'rgba(100, 116, 139, 0.5)' })],
        scales: {
          x: { ...commonChartAxis, scale: () => scaleBand<string>().padding(0.28) },
          y: { ...commonChartAxis, scale: scaleLinear, nice: 10 },
        },
      }),
      evaluationChart: defineChart({
        ...commonChartOption,
        marks: [barX(evaluationRows, { x: 'count', y: 'label', fill: 'rgba(100, 116, 139, 0.5)' })],
        scales: {
          x: { ...commonChartAxis, scale: scaleLinear, nice: 10 },
          y: { ...commonChartAxis, scale: () => scaleBand<string>().padding(0.28) },
        },
      }),
    };
  }, [system, records]);

  return (
    <div className="space-y-4 @container">
      <div className="flex flex-col gap-8 @xl:flex-row">
        <div className="min-w-0 flex-1">
          <Chart definition={resultChart} height={300} ariaLabel="出目の分布" />
        </div>
        <div className="min-w-0 flex-1">
          <Chart definition={evaluationChart} height={300} ariaLabel="判定結果の内訳" />
        </div>
      </div>
    </div>
  );
};
