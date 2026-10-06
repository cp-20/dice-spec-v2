'use client';

import { areaY } from '@tanstack/charts/area';
import { lineY } from '@tanstack/charts/line';
import { Chart } from '@tanstack/charts/react';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { defineChart } from '@tanstack/charts/scene';
import { type FC, useMemo } from 'react';

import type { DiceExpecterResult } from '@/features/dice-expectation/expecter';
import { commonChartAxis, commonChartOption } from '@/shared/lib/commonChartOption';

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
      marks: segments.flatMap(({ points: segmentPoints, color: segmentColor }) => [
        areaY(segmentPoints, { x: 'value', y: 'probability', fill: segmentColor, fillOpacity: 1 }),
        lineY(segmentPoints, {
          x: 'value',
          y: 'probability',
          stroke: segmentColor,
          strokeWidth: 3,
          // 点が重なる密な分布は線だけで描き、SVG要素数を抑える。
          points: points.length <= 100,
        }),
      ]),
      scales: {
        x: { ...commonChartAxis, scale: scalePoint<string>().domain(points.map(({ value }) => value)) },
        y: { ...commonChartAxis, scale: scaleLinear, nice: 10 },
      },
    });
  }, [result]);

  if (!definition) return <div className="h-75" />;

  return <Chart definition={definition} height={300} ariaLabel="確率分布" />;
};
