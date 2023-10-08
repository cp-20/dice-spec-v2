'use client';
import type { ChartOptions } from 'chart.js';
import merge from 'deepmerge';
import type { FC } from 'react';
import { useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useChartElement } from './hooks/useDiceExpectResultDistribution';
import { useDiceExpecterResult } from './hooks/useDiceExpecter';
import { commonChartOption } from '@/shared/lib/commonChartOption';

export const ExpectResultDistributionChart: FC = () => {
  const { result } = useDiceExpecterResult();
  const { chartElement } = useChartElement();

  useEffect(() => {
    import('chart.js').then(
      ({
        Chart,
        LineController,
        LineElement,
        CategoryScale,
        LinearScale,
        PointElement,
        Filler,
      }) => {
        Chart.register(
          LineController,
          LineElement,
          CategoryScale,
          LinearScale,
          PointElement,
          Filler,
        );
      },
    );
  }, []);

  if (!result || !result?.success || !chartElement) {
    return null;
  }

  const options: ChartOptions<'line'> = merge(commonChartOption, {
    scales: { y: { min: 0 } },
  });

  return (
    <div>
      <Line
        data={{
          labels: chartElement.values,
          datasets: [
            {
              data: chartElement.chances,
              backgroundColor: 'rgba(100, 116, 139, 0.2)',
              fill: true,
            },
            {
              data: chartElement.chancesCI,
              backgroundColor: 'rgba(100, 116, 139, 0.5)',
              fill: true,
            },
            {
              data: chartElement.chancesTarget,
              backgroundColor: 'rgba(51, 65, 85, 0.5)',
              fill: true,
            },
          ],
        }}
        height={300}
        options={options}
      />
    </div>
  );
};
