import type { ComponentPropsWithoutRef, FC, ForwardRefRenderFunction } from 'react';
import { forwardRef } from 'react';

import { twMerge } from 'tailwind-merge';

const unrefH1: ForwardRefRenderFunction<HTMLHeadingElement, ComponentPropsWithoutRef<'h1'>> = (
  { children, className, ...props },
  ref,
) => {
  return (
    <h1
      className={twMerge('scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl', className)}
      ref={ref}
      {...props}
    >
      {children}
    </h1>
  );
};

export const H1: FC<ComponentPropsWithoutRef<'h1'>> = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<'h1'>>(
  unrefH1,
);
