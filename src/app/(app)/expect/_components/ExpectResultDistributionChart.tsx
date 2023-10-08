'use client';

import type { ChartOptions } from 'chart.js';
import type { FC } from 'react';
import { useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useChartElement } from './hooks/useDiceExpectResultDistribution';
import { useDiceExpecterResult } from './hooks/useDiceExpecter';
import { fontNotoSansJP } from '@/shared/fonts/NotoSansJP';

export const ExpectResultDistributionChart: FC = () => {
  const { result } = useDiceExpecterResult();
  const { chartElement } = useChartElement();

  useEffect(() => {
    import('chart.js').then(({ Chart, registerables }) => {
      Chart.register(...registerables);
    });
  }, []);

  if (!result || !result?.success || !chartElement) {
    return null;
  }

  const options: ChartOptions<'line'> = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#747474',
        },
        grid: {
          color: '#e5e5e5',
        },
      },
      y: {
        min: 0,
        ticks: {
          color: '#747474',
        },
        grid: {
          color: '#e5e5e5',
        },
      },
    },
    font: {
      family: fontNotoSansJP.style.fontFamily,
    },
  };

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
