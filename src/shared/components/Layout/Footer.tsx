import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';

export const Footer: FC<ComponentProps<'footer'>> = ({
  className,
  ...props
}) => (
  <footer
    className={twMerge('grid place-content-center bg-slate-100 p-2', className)}
    {...props}
  >
    © 2022-2023 cp20
  </footer>
);
