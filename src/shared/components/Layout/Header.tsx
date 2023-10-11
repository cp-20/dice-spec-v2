import { IconBrandDiscord, IconBrandX } from '@tabler/icons-react';
import Link from 'next/link';
import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/shared/components/ui/button';
import { appVersion } from '@/shared/lib/const';
import TitleLogo from '/public/title-logo.svg';

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
        href="/"
        className="transition-opacity duration-100 hover:opacity-70"
      >
        <TitleLogo className="h-7 w-[8.75rem] text-slate-800 max-sm:h-6 max-sm:w-[7.5ren]" />
      </Link>
      <div className="max-sm:text-sm">v{appVersion}</div>
    </div>
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6 sm:h-8 sm:w-8"
        asChild
      >
        <a
          href="https://discord.gg/YQ7negGTUK"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconBrandDiscord className="h-4 w-5 sm:h-5 sm:w-5" />
        </a>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6 sm:h-8 sm:w-8"
        asChild
      >
        <a
          href="https://twitter.com/__cp20__"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconBrandX className="h-4 w-5 sm:h-5 sm:w-5" />
        </a>
      </Button>
    </div>
  </header>
);
