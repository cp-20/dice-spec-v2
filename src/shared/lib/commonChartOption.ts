import { motion } from '@tanstack/charts/motion';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import type { ChartAxisOptions, ChartDefinitionOptions, ChartTheme } from '@tanstack/charts/types';

export const commonChartOption = {
  theme: {
    foreground: '#475569',
    muted: '#64748b',
    grid: '#e2e8f0',
    background: '#ffffff',
    palette: ['rgba(100, 116, 139, 0.5)'],
  } satisfies ChartTheme,
  motion: ({ phase }) => ({
    transition: {
      type: 'tween',
      duration: phase === 'enter' ? 400 : 250,
      easing: (progress: number) => 1 - (1 - progress) ** 3,
    },
  }),
  tooltip: { use: tooltip, motion: false },
} satisfies ChartDefinitionOptions & { theme: ChartTheme };

export const commonChartAxis = {
  grid: { stroke: '#e2e8f0', strokeOpacity: 0.7, strokeWidth: 1 },
  axis: {
    motion: false,
    line: { stroke: '#cbd5e1' },
    ticks: { count: 5, size: 0, padding: 8 },
    tickLabels: { fontSize: 12, fontWeight: 400, opacity: 1 },
  },
} satisfies Omit<ChartAxisOptions, 'scale'>;

// 遅延読み込み時の初期SVGにも、初回表示のアニメーションを適用する。
export const chartRenderer = motion({ initial: 'always', transition: { type: 'tween', duration: 400 } });

export const probabilityFormat = new Intl.NumberFormat('ja-JP', { style: 'percent', maximumSignificantDigits: 3 });

export const countChartAxis = (max: number) => {
  const scale = scaleLinear()
    .domain([0, Math.max(1, max)])
    .nice(5);
  return {
    ...commonChartAxis,
    scale,
    axis: {
      ...commonChartAxis.axis,
      ticks: {
        size: 0,
        padding: 8,
        values: scale.ticks(5).filter(Number.isInteger),
        format: (value: number) => `${value}回`,
      },
    },
  };
};
