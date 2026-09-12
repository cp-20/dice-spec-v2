import Logo from '/public/title-logo.svg';
import type { FC } from 'react';

interface TitleLogoProps {
  className?: string;
}

export const TitleLogo: FC<TitleLogoProps> = (props) => {
  return <Logo {...props} />;
};
