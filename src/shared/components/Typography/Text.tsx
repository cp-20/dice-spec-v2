import type { ComponentPropsWithRef, FC } from 'react';
import { twMerge } from 'tailwind-merge';

export const Text: FC<ComponentPropsWithRef<'p'>> = ({ children, className, ref, ...props }) => {
  return (
    <p className={twMerge('leading-7 not-first:mt-6', className)} ref={ref} {...props}>
      {children}
    </p>
  );
};
