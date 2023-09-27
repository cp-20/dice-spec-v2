import { forwardRef } from 'react';
import type {
  ComponentPropsWithoutRef,
  FC,
  ForwardRefRenderFunction,
} from 'react';

import { twMerge } from 'tailwind-merge';

const unrefH2: ForwardRefRenderFunction<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<'h2'>
> = ({ children, className, ...props }, ref) => {
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

export const H2: FC<ComponentPropsWithoutRef<'h2'>> = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<'h2'>
>(unrefH2);
