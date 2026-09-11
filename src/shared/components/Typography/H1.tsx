import type { ComponentPropsWithRef, FC } from 'react';
import { twMerge } from 'tailwind-merge';

export const H1: FC<ComponentPropsWithRef<'h1'>> = ({ children, className, ref, ...props }) => {
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
