import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';

export const InlineCommand: FC<ComponentProps<'span'>> = ({ className, children, ...props }) => (
  <span className={twMerge('mx-1 rounded bg-muted px-[0.3rem] py-[0.2rem] text-sm font-medium', className)} {...props}>
    {children}
  </span>
);
