import { forwardRef } from 'react';
import type {
  ComponentPropsWithoutRef,
  FC,
  ForwardRefRenderFunction,
} from 'react';

import { twMerge } from 'tailwind-merge';

const unrefH3: ForwardRefRenderFunction<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<'h3'>
> = ({ children, className, ...props }, ref) => {
  return (
    <h3
      className={twMerge(
        'scroll-m-20 text-2xl font-semibold tracking-tight',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </h3>
  );
};

export const H3: FC<ComponentPropsWithoutRef<'h3'>> = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<'h3'>
>(unrefH3);
