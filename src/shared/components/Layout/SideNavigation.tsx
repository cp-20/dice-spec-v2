import clsx from 'clsx';
import { t } from 'i18next';
import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';
import type { CustomLinkProps } from '@/shared/components/elements/CustomLink';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import { navLinks } from '@/shared/lib/navigation';

export type SideNavigationProps = {
  active: (typeof navLinks)[number]['href'];
  textProps?: ComponentProps<'span'>;
};

export const SideNavigation: FC<ComponentProps<'nav'> & SideNavigationProps> = ({
  className,
  active,
  textProps,
  ...props
}) => (
  <nav className={twMerge('flex w-60 flex-col border-r', className)} {...props}>
    {navLinks.map(({ href, icon }) => (
      <SideNavigationLink key={href} icon={icon} href={t('link', { href })} isActive={href === active}>
        <span {...textProps}>{t(`common:${href.slice(1)}.title`)}</span>
      </SideNavigationLink>
    ))}
  </nav>
);

type SideNavigationLinkProps = {
  icon?: FC;
  isActive?: boolean;
};

const SideNavigationLink: FC<CustomLinkProps & SideNavigationLinkProps> = ({
  className,
  icon: Icon,
  isActive,
  children,
  ...props
}) => (
  <CustomLink
    className={twMerge(
      clsx(
        'flex w-full items-center gap-1 rounded-none px-4 py-2 transition-colors duration-100 hover:bg-slate-50 active:bg-slate-100',
        isActive && 'bg-slate-100 hover:bg-slate-100',
      ),
      className,
    )}
    {...props}
  >
    {Icon && <Icon />}
    {children}
  </CustomLink>
);
