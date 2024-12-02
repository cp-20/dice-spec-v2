import type { ComponentProps, FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type PanelProps = {
  label: ReactNode;
  contents: ReactNode;
};

export const Panel: FC<ComponentProps<'div'> & PanelProps> = ({ label, contents, className, ...props }) => (
  <div className={twMerge('space-y-2 border p-4', className)} {...props}>
    <div className="text-lg font-bold md:text-center">{label}</div>
    <div className="text-sm text-slate-600">{contents}</div>
  </div>
);
