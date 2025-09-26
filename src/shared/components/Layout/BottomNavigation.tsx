import type { IconProps } from '@tabler/icons-react';
import clsx from 'clsx';
import { t } from 'i18next';
import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';
import type { CustomLinkProps } from '@/shared/components/elements/CustomLink';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import type { NavPaths } from '@/shared/lib/navigation';
import { navLinks } from '@/shared/lib/navigation';

export type BottomNavigationProps = {
  active?: NavPaths;
};

export const BottomNavigation: FC<ComponentProps<'nav'> & BottomNavigationProps> = ({
  active,
  className,
  ...props
}) => (
  <nav className={twMerge('flex border-t', className)} {...props}>
    {navLinks.map(({ href, icon }) => (
      <BottomNavigationLink key={href} href={href} icon={icon} isActive={href === active} />
    ))}
  </nav>
);

type SideNavigationLinkProps = {
  icon: FC<IconProps>;
  isActive?: boolean;
};

const BottomNavigationLink: FC<CustomLinkProps & SideNavigationLinkProps> = ({
  className,
  icon: Icon,
  isActive,
  ...props
}) => (
  <CustomLink
    className={twMerge(
      clsx(
        'flex-1 flex flex-col justify-center items-center gap-0.5 p-1 hover:bg-slate-50 active:bg-slate-100',
        isActive && 'bg-slate-100 hover:bg-slate-100',
      ),
      className,
    )}
    {...props}
  >
    <Icon />
    <span className="text-xs font-bold text-pretty text-center">{t(`common:${props.href.slice(1)}.title`)}</span>
  </CustomLink>
);
