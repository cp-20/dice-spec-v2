'use client';

import { t } from 'i18next';
import type { FC } from 'react';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import { cn } from '@/shared/lib/shadcn-utils';

type GoogleSignInAgreementProps = {
  className?: string;
};

export const GoogleSignInAgreement: FC<GoogleSignInAgreementProps> = ({ className }) => {
  return (
    <p className={cn('mx-auto px-2 text-center text-xs leading-relaxed text-slate-500', className)}>
      {t('profile:agreement.prefix')}
      <CustomLink href={t('link', { href: '/terms' })} className="underline underline-offset-2 hover:text-slate-700">
        {t('profile:agreement.terms')}
      </CustomLink>
      {t('profile:agreement.conjunction')}
      <CustomLink
        href={t('link', { href: '/privacy-policy' })}
        className="underline underline-offset-2 hover:text-slate-700"
      >
        {t('profile:agreement.privacy')}
      </CustomLink>
      {t('profile:agreement.suffix')}
    </p>
  );
};
