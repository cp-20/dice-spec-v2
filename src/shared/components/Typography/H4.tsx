import { forwardRef } from 'react';
import type {
  ComponentPropsWithoutRef,
  FC,
  ForwardRefRenderFunction,
} from 'react';

import { twMerge } from 'tailwind-merge';

const unrefH4: ForwardRefRenderFunction<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<'h4'>
> = ({ children, className, ...props }, ref) => {
  return (
    <h4
      className={twMerge(
        'scroll-m-20 text-xl font-semibold tracking-tight',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </h4>
  );
};

export const H4: FC<ComponentPropsWithoutRef<'h4'>> = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<'h4'>
>(unrefH4);
