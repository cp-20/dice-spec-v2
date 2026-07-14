'use client';

import TitleLogoEN from '/public/title-logo-en.svg';
import TitleLogoJP from '/public/title-logo.svg';
import { IconMessageReply } from '@tabler/icons-react';
import { t } from 'i18next';
import dynamic from 'next/dynamic';
import { type ComponentProps, type FC, type ReactNode, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { CustomLink } from '@/shared/components/elements/CustomLink';
import { Button } from '@/shared/components/ui/button';
import { appVersion } from '@/shared/lib/const';

const loadFeedbackDialog = () => import('./FeedbackDialog');
const FeedbackDialog = dynamic(() => loadFeedbackDialog().then((mod) => mod.FeedbackDialog), { ssr: false });

type HeaderProps = ComponentProps<'header'> & {
  account?: ReactNode;
};

export const Header: FC<HeaderProps> = ({ account, className, ...props }) => {
  const TitleLogo = t('lang') === 'en' ? TitleLogoEN : TitleLogoJP;
  const [feedbackLoaded, setFeedbackLoaded] = useState(false);

  return (
    <header className={twMerge('flex items-center justify-between border-b px-4 py-2', className)} {...props}>
      <div className="flex items-center gap-2">
        <CustomLink
          href={t('link', { href: '/' })}
          className="transition-opacity duration-100 hover:opacity-70"
          aria-label={t('common:header.app-name')}
        >
          <TitleLogo className="h-5 w-auto text-slate-800 max-sm:h-7 max-sm:w-40" />
        </CustomLink>
        <div>v{appVersion}</div>
      </div>
      <div className="flex items-center gap-2">
        {account}
        {feedbackLoaded ? (
          <FeedbackDialog />
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            title={t('common:header.feedback-button')}
            onPointerEnter={() => void loadFeedbackDialog()}
            onFocus={() => void loadFeedbackDialog()}
            onClick={() => setFeedbackLoaded(true)}
          >
            <IconMessageReply className="size-5" />
          </Button>
        )}
      </div>
    </header>
  );
};
