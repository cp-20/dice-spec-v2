import type { IconProps } from '@tabler/icons-react';
import type { FC, ReactNode } from 'react';
import { H1 } from '@/shared/components/Typography/H1';

export type PageTitleProps = {
  icon: FC<IconProps>;
  children?: ReactNode;
};

export const PageTitle: FC<PageTitleProps> = ({ icon: Icon, children }) => (
  <H1 className="flex gap-2 text-3xl lg:text-4xl">
    <Icon className="size-10" />
    <span>{children}</span>
  </H1>
);
