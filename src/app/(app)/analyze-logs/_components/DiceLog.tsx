import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';

export type DiceLogType = {
  variant: 'success' | 'failed' | 'default';
  value: string;
};

export type DiceLogProps = {
  log: DiceLogType;
};

export const DiceLog: FC<DiceLogProps & ComponentProps<'div'>> = ({
  log,
  className,
  ...props
}) => (
  <div
    className={twMerge(
      'text-sm',
      log.variant === 'success' && 'text-blue-600',
      log.variant === 'failed' && 'text-red-700',
      className,
    )}
    {...props}
  >
    {log.value}
  </div>
);
