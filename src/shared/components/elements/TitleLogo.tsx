import clsx from 'clsx';
import Image from 'next/image';
import type { ComponentProps, FC } from 'react';
import TitleLogoImage from '/public/title-logo.svg';
import { twMerge } from 'tailwind-merge';
import styles from './TitleLogo.module.css';

export type TitleLogoProps = {
  size?: number;
};

export const TitleLogo: FC<ComponentProps<'div'> & TitleLogoProps> = ({
  className,
  size,
  ...props
}) => {
  return (
    <div className={twMerge('relative', className)} {...props}>
      <Image
        src={TitleLogoImage}
        height={size}
        className={clsx('select-text text-slate-700', styles['title-logo'])}
        alt="ダイススペック"
      />
    </div>
  );
};
