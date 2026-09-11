'use client';

import { t } from 'i18next';
import type { FC } from 'react';

import { ContainerSection } from '@/app/[locale]/(app)/_components/ContainerSection';
import { RichText } from '@/shared/components/elements/RichText';

import { useAdvancedSettings } from './hooks/useAdvancedSettings';
import { useDiceRollOption } from './hooks/useDiceRollOption';

export const DiceBotHelp: FC = () => {
  const { option } = useDiceRollOption();
  const systemName = option.systemInfo?.name ?? '';
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
      ) : (
        <p className="text-sm">
          {t(option.error ? 'dice:advanced.game-system.error' : 'dice:advanced.game-system.loading')}
        </p>
      )}
    </ContainerSection>
  );
};
