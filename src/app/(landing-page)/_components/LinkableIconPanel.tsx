import type { TablerIconsProps } from '@tabler/icons-react';
import Link from 'next/link';
import type { LinkProps } from 'next/link';
import type { ComponentProps, FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type LinkableIconPanelProps = {
  icon: FC<TablerIconsProps>;
  label: ReactNode;
  contents: React.ReactNode;
};

export const LinkableIconPanel: FC<
  ComponentProps<'a'> & LinkProps<never> & LinkableIconPanelProps
> = ({ icon: Icon, label, contents, className, ...props }) => (
  <Link
    className={twMerge(
      'flex cursor-pointer gap-2 rounded-md border p-4 pt-6 transition-colors duration-75 hover:bg-slate-50 active:bg-slate-100 max-md:gap-4 md:flex-col md:items-center',
      className,
    )}
    {...props}
  >
    <Icon className="h-12 w-12 max-sm:h-9 max-sm:w-9" />

    <div className="flex flex-1 flex-col gap-4">
      <div className="text-lg font-bold md:text-center">{label}</div>
      <div className="text-sm text-slate-600">{contents}</div>
    </div>
  </Link>
);
