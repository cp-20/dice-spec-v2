'use client';

import type { ChartOptions, ScriptableLineSegmentContext } from 'chart.js';
import merge from 'deepmerge';
import dynamic from 'next/dynamic';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

import type { DiceExpecterResult } from '@/features/dice-expectation/expecter';
import { commonChartOption } from '@/shared/lib/commonChartOption';

const Line = dynamic(async () => (await import('react-chartjs-2')).Line, { ssr: false });

export const ExpectResultDistributionChartView: FC<{ result: DiceExpecterResult }> = ({ result }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    import('chart.js').then(
      ({ Chart, LineController, LineElement, CategoryScale, LinearScale, PointElement, Filler }) => {
        Chart.register(LineController, LineElement, CategoryScale, LinearScale, PointElement, Filler);
        setLoaded(true);
      },
    );
  }, []);

  if (!result.success || !loaded) return <div className="h-75" />;

  const options: ChartOptions<'line'> = merge(commonChartOption, {
    scales: { y: { min: 0 } },
  });

  const inCI = (ctx: ScriptableLineSegmentContext) =>
    // biome-ignore lint/style/noNonNullAssertion: chart.js が数値軸の x を常に渡す
    result.CI.min < result.range.min + ctx.p0.parsed.x! + 1 && result.range.min + ctx.p1.parsed.x! - 1 < result.CI.max;

  const inTarget = (ctx: ScriptableLineSegmentContext) =>
    result.withTarget &&
    // biome-ignore lint/style/noNonNullAssertion: chart.js が数値軸の x を常に渡す
    ((result.target.sign === '<=' && result.range.min + ctx.p1.parsed.x! <= result.target.value) ||
      // biome-ignore lint/style/noNonNullAssertion: chart.js が数値軸の x を常に渡す
      (result.target.sign === '>=' && result.range.min + ctx.p0.parsed.x! >= result.target.value));

  const color = (ctx: ScriptableLineSegmentContext) => {
    if (inTarget(ctx)) return 'rgba(51, 65, 85, 0.5)';
    if (inCI(ctx)) return 'rgba(100, 116, 139, 0.5)';
    return 'rgba(100, 116, 139, 0.2)';
  };

  const labels = Object.keys(result.distribution).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="relative h-75">
      <Line
        data={{
          labels,
          datasets: [
            {
              data: labels.map((key) => result.distribution[key]),
              fill: true,
              segment: { backgroundColor: color, borderColor: color },
            },
          ],
        }}
        height={300}
        options={options}
      />
    </div>
  );
};
