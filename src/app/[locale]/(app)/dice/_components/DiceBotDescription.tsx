'use client';

import { t } from 'i18next';
import type { FC } from 'react';

import { ContainerSection } from '@/app/[locale]/(app)/_components/ContainerSection';
import { RichText } from '@/shared/components/elements/RichText';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { gameSystems } from '@/shared/lib/bcdice/loader';

import { useAdvancedSettings } from './hooks/useAdvancedSettings';
import { useDiceRollOption } from './hooks/useDiceRollOption';

export const DiceBotHelp: FC = () => {
  const { option } = useDiceRollOption();
  const systemName = gameSystems.find(({ id }) => id === option.system)?.name ?? option.systemInfo?.name ?? '';
  const helpMessage = option.systemInfo?.help_message ?? '';
  const { advancedSettings } = useAdvancedSettings();

  if (!advancedSettings.showHelp) {
    return null;
  }

  return (
    <ContainerSection
      className="h-64 overflow-y-auto"
      tabIndex={0}
      aria-busy={!option.systemInfo && !option.error}
      label={t('dice:advanced.dicebot-usage', { systemName })}
    >
      {option.systemInfo ? (
        <RichText className="text-sm" text={helpMessage} />
      ) : option.error ? (
        <p className="text-sm">{t('dice:advanced.game-system.error')}</p>
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
