'use client';

import type { ChartOptions, ScriptableLineSegmentContext } from 'chart.js';
import merge from 'deepmerge';
import dynamic from 'next/dynamic';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useDiceExpecterResult } from './hooks/useDiceExpecter';
import { commonChartOption } from '@/shared/lib/commonChartOption';

const Line = dynamic(async () => (await import('react-chartjs-2')).Line, {
  ssr: false,
});

export const ExpectResultDistributionChart: FC = () => {
  const { result } = useDiceExpecterResult();
  // const { chartElement } = useChartElement();

  useEffect(() => {
    import('chart.js').then(
      ({ Chart, LineController, LineElement, CategoryScale, LinearScale, PointElement, Filler }) => {
        Chart.register(LineController, LineElement, CategoryScale, LinearScale, PointElement, Filler);
      },
    );
  }, []);

  if (!result || !result?.success) {
    return null;
  }

  const options: ChartOptions<'line'> = merge(commonChartOption, {
    scales: { y: { min: 0 } },
  });

  const inCI = (ctx: ScriptableLineSegmentContext) => {
    return (
      result.CI.min < result.range.min + ctx.p0.parsed.x + 1 && result.range.min + ctx.p1.parsed.x - 1 < result.CI.max
    );
  };

  const inTarget = (ctx: ScriptableLineSegmentContext) => {
    if (!result.withTarget) return false;

    return (
      (result.target.sign === '<=' && result.range.min + ctx.p1.parsed.x <= result.target.value) ||
      (result.target.sign === '>=' && result.range.min + ctx.p0.parsed.x >= result.target.value)
    );
  };

  const colorFunc = (ctx: ScriptableLineSegmentContext) => {
    if (inTarget(ctx)) return 'rgba(51, 65, 85, 0.5)';
    if (inCI(ctx)) return 'rgba(100, 116, 139, 0.5)';
    return 'rgba(100, 116, 139, 0.2)';
  };

  const labels = Object.keys(result.distribution).sort((a, b) => Number(a) - Number(b));

  return (
    <div>
      <Line
        data={{
          labels,
          datasets: [
            {
              data: labels.map((key) => result.distribution[key]),
              fill: true,
              segment: {
                backgroundColor: colorFunc,
                borderColor: colorFunc,
              },
            },
          ],
        }}
        height={300}
        options={options}
      />
    </div>
  );
};
