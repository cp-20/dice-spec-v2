import { IconBrandDiscord, IconBrandX, IconSunHigh } from '@tabler/icons-react';
import clsx from 'clsx';
import Link from 'next/link';
import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/shared/components/ui/button';
import { fontZenKakuGothicAntique } from '@/shared/fonts/ZenKakuGothicAntique';

export const Header: FC<ComponentProps<'header'>> = ({
  className,
  ...props
}) => (
  <header
    className={twMerge(
      'flex items-center justify-between border-b px-4 py-2 max-sm:py-1',
      className,
    )}
    {...props}
  >
    <div className="flex items-center gap-2">
      <Link
        className={clsx(
          'font-bold sm:text-lg',
          fontZenKakuGothicAntique.className,
        )}
        href="/"
      >
        ダイススペック
      </Link>
      <div className="max-sm:text-sm">v2.0.1</div>
    </div>
    <div className="flex gap-2">
      <Button variant="outline" size="icon" className="h-6 w-6 sm:h-8 sm:w-8">
        <IconBrandDiscord className="h-4 w-5 sm:h-5 sm:w-5" />
      </Button>
      <Button variant="outline" size="icon" className="h-6 w-6 sm:h-8 sm:w-8">
        <IconBrandX className="h-4 w-5 sm:h-5 sm:w-5" />
      </Button>
      <Button variant="outline" size="icon" className="h-6 w-6 sm:h-8 sm:w-8">
        <IconSunHigh className="h-4 w-5 sm:h-5 sm:w-5" />
      </Button>
    </div>
  </header>
);
