import type { ChartOptions } from 'chart.js';

export const commonChartOption = {
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
      ticks: {
        color: '#747474',
      },
      grid: {
        color: '#e5e5e5',
      },
    },
  },
  font: {
    family: 'var(--font-main)',
  },
} satisfies ChartOptions;
