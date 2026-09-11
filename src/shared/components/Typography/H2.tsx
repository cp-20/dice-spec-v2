import type { ComponentPropsWithRef, FC } from 'react';
import { twMerge } from 'tailwind-merge';

export const H2: FC<ComponentPropsWithRef<'h2'>> = ({ children, className, ref, ...props }) => {
  return (
    <h2
      className={twMerge(
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </h2>
  );
};
