import clsx from 'clsx';
import type { ComponentProps, FC, ReactNode } from 'react';
import styles from '@/shared/styles/pretty-scrollbar.module.css';

export type ContainerSectionProps = {
  label?: ReactNode;
  scrollable?: boolean;
};

export const ContainerSection: FC<
  ComponentProps<'div'> & ContainerSectionProps
> = ({ scrollable = false, label, className, children, ...props }) => (
  <div
    className={clsx(
      'rounded-md border p-4',
      scrollable && 'max-h-40 overflow-y-auto',
      scrollable && styles['pretty-scrollbar'],
      className,
    )}
    {...props}
  >
    {label && <div className="mb-3 font-bold">{label}</div>}
    <div>{children}</div>
  </div>
);
