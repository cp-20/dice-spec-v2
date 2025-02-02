import type { IconProps } from '@tabler/icons-react';
import type { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import type { CustomLinkProps } from '@/shared/components/elements/CustomLink';
import { CustomLink } from '@/shared/components/elements/CustomLink';

export type LinkableIconPanelProps = {
  icon: FC<IconProps>;
  label: ReactNode;
  contents: React.ReactNode;
};

export const LinkableIconPanel: FC<CustomLinkProps & LinkableIconPanelProps> = ({
  icon: Icon,
  label,
  contents,
  className,
  ...props
}) => (
  <CustomLink
    className={twMerge(
      'flex cursor-pointer gap-2 rounded-md border p-4 pt-6 transition-colors duration-75 hover:bg-slate-50 active:bg-slate-100 max-md:gap-4 md:flex-col md:items-center',
      className,
    )}
    {...props}
  >
    <Icon className="size-12 max-sm:size-9" />

    <div className="flex flex-1 flex-col gap-4">
      <div className="text-lg font-bold md:text-center">{label}</div>
      <div className="text-sm text-slate-600">{contents}</div>
    </div>
  </CustomLink>
);
