import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';

export type DiceLogType = {
  success: boolean;
  failure: boolean;
  value: string;
};

export type DiceLogProps = {
  log: DiceLogType;
};

export const DiceLog: FC<DiceLogProps & ComponentProps<'div'>> = ({ log, className, ...props }) => (
  <div
    className={twMerge('text-sm', log.success && 'text-blue-500', log.failure && 'text-red-600', className)}
    {...props}
  >
    {log.value}
  </div>
);
