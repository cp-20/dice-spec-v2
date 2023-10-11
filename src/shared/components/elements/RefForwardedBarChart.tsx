import type { ComponentProps, FC, RefObject } from 'react';
import { Bar } from 'react-chartjs-2';
import type {
  ChartJSOrUndefined,
  TypedChartComponent,
} from 'react-chartjs-2/dist/types';

export type RefForwardedBarChartProps = {
  forwardedRef?: RefObject<ChartJSOrUndefined<'bar', number[], string>>;
} & ComponentProps<TypedChartComponent<'bar'>>;

export const RefForwardedBarChart: FC<RefForwardedBarChartProps> = ({
  forwardedRef,
  ...props
}) => {
  return <Bar ref={forwardedRef} {...props} />;
};
