import { forwardRef } from 'react';
import type {
  ComponentPropsWithoutRef,
  FC,
  ForwardRefRenderFunction,
} from 'react';

import { twMerge } from 'tailwind-merge';

const unrefText: ForwardRefRenderFunction<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<'p'>
> = ({ children, className, ...props }, ref) => {
  return (
    <p
      className={twMerge('leading-7 [&:not(:first-child)]:mt-6', className)}
      ref={ref}
      {...props}
    >
      {children}
    </p>
  );
};

export const Text: FC<ComponentPropsWithoutRef<'p'>> = forwardRef<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<'p'>
>(unrefText);
