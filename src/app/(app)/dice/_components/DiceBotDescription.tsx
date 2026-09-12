'use client';

import { useAtomValue } from 'jotai';
import type { FC } from 'react';

import { ContainerSection } from '@/app/(app)/_components/ContainerSection';
import { RichText } from '@/shared/components/elements/RichText';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { gameSystemsById } from '@/shared/lib/bcdice/loader';

import { useAdvancedSettings } from './hooks/useAdvancedSettings';
import { gameSystemAtom } from './hooks/useGameSystem';

export const DiceBotHelp: FC = () => {
  const { system, engine, status } = useAtomValue(gameSystemAtom);
  const systemName = gameSystemsById.get(system)?.name ?? '';
  const { advancedSettings } = useAdvancedSettings();

  if (!advancedSettings.showHelp) {
    return null;
  }

  return (
    <ContainerSection
      className="h-64 overflow-y-auto"
      tabIndex={0}
      aria-busy={status === 'loading'}
      label={`「${systemName}」の使い方`}
    >
      {engine ? (
        <RichText className="text-sm" text={engine.HELP_MESSAGE} />
      ) : status === 'error' ? (
        <p className="text-sm">ゲームシステムを読み込めませんでした。</p>
      ) : (
        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="h-4 w-3/4 motion-reduce:animate-none" />
          <Skeleton className="h-4 w-full motion-reduce:animate-none" />
          <Skeleton className="h-4 w-5/6 motion-reduce:animate-none" />
          <Skeleton className="h-4 w-2/3 motion-reduce:animate-none" />
        </div>
      )}
    </ContainerSection>
  );
};
