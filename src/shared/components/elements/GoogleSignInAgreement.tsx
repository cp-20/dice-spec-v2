'use client';

import type { FC } from 'react';

import { CustomLink } from '@/shared/components/elements/CustomLink';
import { cn } from '@/shared/lib/shadcn-utils';

type GoogleSignInAgreementProps = {
  className?: string;
};

export const GoogleSignInAgreement: FC<GoogleSignInAgreementProps> = ({ className }) => {
  return (
    <p className={cn('mx-auto px-2 text-center text-xs leading-relaxed text-slate-500', className)}>
      アカウントを作成すると、
      <CustomLink href="/terms" className="underline underline-offset-2 hover:text-slate-700">
        利用規約
      </CustomLink>
      および
      <CustomLink href="/privacy-policy" className="underline underline-offset-2 hover:text-slate-700">
        プライバシーポリシー
      </CustomLink>
      に同意したものとみなされます。
    </p>
  );
};
