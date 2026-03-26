'use client';

import { IconLogout, IconUser, IconUserCircle } from '@tabler/icons-react';
import { t } from 'i18next';
import type { FC } from 'react';
import { CustomLink } from '@/shared/components/elements/CustomLink';
import { Button } from '@/shared/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useMeStore } from '@/shared/lib/firebase/stores/userStore';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';

export const AuthWidget: FC = () => {
  const { authUser, loading, signOut } = useFirebaseAuth();
  const { me, meLoading } = useMeStore();

  if (loading || (authUser && meLoading)) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-full" />
      </div>
    );
  }

  if (!authUser || !me) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative size-8 overflow-hidden rounded-full border-2 border-slate-300 transition-all hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          aria-label={t('profile:menu.aria-label')}
        >
          {me.avatarUrl ? (
            // biome-ignore lint/performance/noImgElement: external image
            <img src={me.avatarUrl} alt="" className="size-full object-cover" width={32} height={32} />
          ) : (
            <div className="flex size-full items-center justify-center bg-slate-200">
              <IconUserCircle className="size-6 text-slate-500" />
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="space-y-1 p-2">
          <div className="flex items-center gap-3 border-b pb-3 px-2">
            <div className="relative size-10 overflow-hidden rounded-full">
              {me.avatarUrl ? (
                // biome-ignore lint/performance/noImgElement: external image
                <img src={me.avatarUrl} alt="" className="size-full object-cover" width={40} height={40} />
              ) : (
                <div className="flex size-full items-center justify-center bg-slate-200">
                  <IconUserCircle className="size-8 text-slate-500" />
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-sm font-semibold text-slate-900">{me.name}</div>
              <div className="truncate text-xs text-slate-500">{authUser.email}</div>
            </div>
          </div>

          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <CustomLink href={t('link', { href: '/profile' })}>
              <IconUser className="size-4" />
              <span>{t('profile:menu.profile')}</span>
            </CustomLink>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-600"
            onClick={signOut}
          >
            <IconLogout className="size-4" />
            <span>{t('profile:menu.sign-out')}</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
