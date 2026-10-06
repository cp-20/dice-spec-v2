import type { ChartAxisOptions, ChartDefinitionOptions, ChartTheme } from '@tanstack/charts/types';

export const commonChartOption = {
  theme: {
    foreground: '#747474',
    muted: '#747474',
    grid: '#e5e5e5',
    background: '#ffffff',
    palette: ['rgba(100, 116, 139, 0.5)'],
  } satisfies ChartTheme,
  svgAnimation: false,
  tooltip: false,
  pointer: false,
} satisfies ChartDefinitionOptions & { theme: ChartTheme };

export const commonChartAxis = {
  grid: { stroke: '#e5e5e5', strokeOpacity: 1, strokeWidth: 1 },
  axis: {
    line: { stroke: '#e5e5e5' },
    ticks: { count: 10, size: 6, padding: 5 },
    tickLabels: { fontSize: 12, fontWeight: 400, opacity: 1 },
  },
} satisfies Omit<ChartAxisOptions, 'scale'>;
