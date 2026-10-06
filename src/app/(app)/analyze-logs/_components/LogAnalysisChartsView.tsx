'use client';

import { barX, barY } from '@tanstack/charts/bar';
import { Chart } from '@tanstack/charts/react/core';
import { scaleBand } from '@tanstack/charts/scales/band';
import { defineChart } from '@tanstack/charts/scene';
import { type FC, useMemo } from 'react';

import { systemStats as allSystemStats } from '@/features/log-analysis/ccfolia/messageParser';
import { aggregateResults } from '@/features/log-analysis/ccfolia/resultAggregator';
import type { MessageParserResult, System } from '@/features/log-analysis/model';
import { chartRenderer, commonChartAxis, commonChartOption, countChartAxis } from '@/shared/lib/commonChartOption';
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
        marks: [barY(resultRows, { x: 'label', y: 'count', fill: 'rgba(100, 116, 139, 0.5)', radius: 3 })],
        scales: {
          x: { ...commonChartAxis, grid: false, scale: () => scaleBand<string>().padding(0.28) },
          y: countChartAxis(Math.max(0, ...data)),
        },
        tooltip: {
          ...commonChartOption.tooltip,
          content: ([point]) => ({
            title: `出目 ${point.xValue}`,
            rows: [{ label: '回数', value: `${point.yValue}回` }],
          }),
        },
      }),
      evaluationChart: defineChart({
        ...commonChartOption,
        marks: [barX(evaluationRows, { x: 'count', y: 'label', fill: 'rgba(100, 116, 139, 0.5)', radius: 3 })],
        scales: {
          x: countChartAxis(Math.max(0, ...evaluationRows.map(({ count }) => count))),
          y: { ...commonChartAxis, grid: false, scale: () => scaleBand<string>().padding(0.28) },
        },
        tooltip: {
          ...commonChartOption.tooltip,
          content: ([point]) => ({
            title: String(point.yValue),
            rows: [{ label: '回数', value: `${point.xValue}回` }],
          }),
        },
      }),
    };
  }, [system, records]);

  return (
    <div className="space-y-4 @container">
      <div className="flex flex-col gap-8 @xl:flex-row">
        <div className="min-w-0 flex-1">
          <p className="mb-3 text-sm font-medium">出目の分布</p>
          <Chart definition={resultChart} renderer={chartRenderer} height={300} ariaLabel="出目の分布" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-3 text-sm font-medium">判定結果の内訳</p>
          <Chart definition={evaluationChart} renderer={chartRenderer} height={300} ariaLabel="判定結果の内訳" />
        </div>
      </div>
    </div>
  );
};
