import type { TablerIconsProps } from '@tabler/icons-react';
import clsx from 'clsx';
import type { FC, ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';
import type { CustomLinkProps } from '@/shared/components/elements/CustomLink';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import type { NavPaths } from '@/shared/lib/navigation';
import { navLinks } from '@/shared/lib/navigation';

export type BottomNavigationProps = {
  active?: NavPaths;
};

export const BottomNavigation: FC<
  ComponentProps<'nav'> & BottomNavigationProps
> = ({ active, className, ...props }) => (
  <nav className={twMerge('flex border-t', className)} {...props}>
    {navLinks.map(({ href, icon }) => (
      <BottomNavigationLink
        key={href}
        href={href}
        icon={icon}
        isActive={href === active}
      />
    ))}
  </nav>
);

type SideNavigationLinkProps = {
  icon: FC<TablerIconsProps>;
  isActive?: boolean;
};

const BottomNavigationLink: FC<CustomLinkProps & SideNavigationLinkProps> = ({
  className,
  icon: Icon,
  isActive,
  children,
  ...props
}) => (
  <CustomLink
    className={twMerge(
      clsx(
        'grid flex-1 place-content-center p-2 hover:bg-slate-50 active:bg-slate-100',
        isActive && 'bg-slate-100 hover:bg-slate-100',
      ),
      className,
    )}
    {...props}
  >
    <Icon />
    {children}
  </CustomLink>
);
