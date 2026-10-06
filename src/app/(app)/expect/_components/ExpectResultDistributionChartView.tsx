'use client';

import { areaY } from '@tanstack/charts/area';
import { crosshair } from '@tanstack/charts/crosshair';
import { lineY } from '@tanstack/charts/line';
import { Chart } from '@tanstack/charts/react/core';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { defineChart } from '@tanstack/charts/scene';
import { type FC, useMemo } from 'react';

import type { DiceExpecterResult } from '@/features/dice-expectation/expecter';
import { chartRenderer, commonChartAxis, commonChartOption, probabilityFormat } from '@/shared/lib/commonChartOption';

export const ExpectResultDistributionChartView: FC<{ result: DiceExpecterResult }> = ({ result }) => {
  const definition = useMemo(() => {
    if (!result.success) return null;

    const points = Object.entries(result.distribution)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([value, probability]) => ({ value, probability }));

    const color = (left: number, right: number) => {
      if (
        result.withTarget &&
        ((result.target.sign === '<=' && right <= result.target.value) ||
          (result.target.sign === '>=' && left >= result.target.value))
      ) {
        return 'rgba(51, 65, 85, 0.5)';
      }
      if (left >= result.CI.min && right <= result.CI.max) return 'rgba(100, 116, 139, 0.5)';
      return 'rgba(100, 116, 139, 0.2)';
    };

    const segments: { points: typeof points; color: string }[] = [];
    if (points.length === 1) {
      segments.push({ points, color: color(Number(points[0].value), Number(points[0].value)) });
    }
    for (let i = 1; i < points.length; i++) {
      const left = points[i - 1];
      const right = points[i];
      const segmentColor = color(Number(left.value), Number(right.value));
      const previous = segments.at(-1);
      if (previous?.color === segmentColor) previous.points.push(right);
      else segments.push({ points: [left, right], color: segmentColor });
    }

    return defineChart({
      ...commonChartOption,
      // 密な分布でもフォーカス用の要素を出目ごとに生成せず、ガイドを1つ描く。
      focusRing: false,
      marks: [
        ...segments.flatMap(({ points: segmentPoints, color: segmentColor }) => [
          areaY(segmentPoints, { x: 'value', y: 'probability', fill: segmentColor, fillOpacity: 0.55 }),
          lineY(segmentPoints, {
            x: 'value',
            y: 'probability',
            stroke:
              segmentColor === 'rgba(51, 65, 85, 0.5)'
                ? '#334155'
                : segmentColor === 'rgba(100, 116, 139, 0.5)'
                  ? '#64748b'
                  : '#94a3b8',
            strokeWidth: 2.5,
            // 点が重なる密な分布は線だけで描き、SVG要素数を抑える。
            points: points.length <= 100,
          }),
        ]),
        crosshair({
          y: false,
          stroke: '#94a3b8',
          strokeDasharray: '3 3',
          marker: { fill: '#ffffff', stroke: '#334155', radius: 4 },
          motion: false,
        }),
      ],
      scales: {
        x: { ...commonChartAxis, grid: false, scale: scalePoint<string>().domain(points.map(({ value }) => value)) },
        y: {
          ...commonChartAxis,
          scale: scaleLinear,
          nice: 5,
          axis: {
            ...commonChartAxis.axis,
            ticks: { ...commonChartAxis.axis.ticks, format: (value: number) => probabilityFormat.format(value) },
          },
        },
      },
      focus: 'nearest-x',
      tooltip: {
        ...commonChartOption.tooltip,
        content: ([point]) => ({
          title: `出目 ${point.xValue}`,
          rows: [{ label: '確率', value: probabilityFormat.format(Number(point.yValue)) }],
        }),
      },
    });
  }, [result]);

  if (!definition || !result.success) return <div className="h-75" />;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="font-medium">確率分布</span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-slate-400/50" />
          信頼区間 (P95): {result.CI.min}~{result.CI.max}
        </span>
        {result.withTarget && (
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-700/70" />
            目標範囲: {result.target.value}
            {result.target.sign === '>=' ? '以上' : '以下'}
          </span>
        )}
      </div>
      <Chart definition={definition} renderer={chartRenderer} height={300} ariaLabel="確率分布" />
    </div>
  );
};
