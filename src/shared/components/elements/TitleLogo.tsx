import { t } from 'i18next';
import type { FC } from 'react';
import TitleLogoJP from '/public/title-logo.svg';
import TitleLogoEN from '/public/title-logo-en.svg';

interface TitleLogoProps {
  className?: string;
}

export const TitleLogo: FC<TitleLogoProps> = (props) => {
  const Logo = t('lang') === 'en' ? TitleLogoEN : TitleLogoJP;
  return <Logo {...props} />;
};
