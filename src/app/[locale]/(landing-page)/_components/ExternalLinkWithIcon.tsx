import type { IconProps } from '@tabler/icons-react';
import type { LinkProps } from 'next/link';
import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';

export type IconLinkProps = {
  icon: FC<IconProps>;
};

export const ExternalLinkWithIcon: FC<ComponentProps<'a'> & LinkProps<never> & IconLinkProps> = ({
  children,
  className,
  icon: Icon,
  ...props
}) => {
  return (
    <a
      className={twMerge('inline-flex items-center gap-1 hover:text-slate-600 hover:underline', className)}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      <Icon />
      <span>{children}</span>
    </a>
  );
};
