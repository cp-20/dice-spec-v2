import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { Text } from '@/shared/components/Typography/Text';

export const PageDescriptionContainer: FC<ComponentProps<'div'>> = ({
  className,
  children,
  ...props
}) => (
  <div className={twMerge('mt-4 space-y-2', className)} {...props}>
    {children}
  </div>
);

export const PageDescriptionText: FC<ComponentProps<'p'>> = ({
  className,
  children,
  ...props
}) => (
  <Text
    className={twMerge('leading-6 [&:not(:first-child)]:mt-0', className)}
    {...props}
  >
    {children}
  </Text>
);
