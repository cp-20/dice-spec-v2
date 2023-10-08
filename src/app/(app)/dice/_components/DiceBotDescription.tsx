'use client';

import type { FC } from 'react';
import { useAdvancedSettings } from './hooks/useAdvancedSettings';
import { useDiceRollOption } from './hooks/useDiceRollOption';
import { ContainerSection } from '@/app/(app)/_components/ContainerSection';
import { RichText } from '@/shared/components/elements/RichText';

export const DiceBotHelp: FC = () => {
  const { option } = useDiceRollOption();
  const systemName = option.systemInfo.name;
  const helpMessage = option.systemInfo.help_message;
  const { advancedSettings } = useAdvancedSettings();

  if (!advancedSettings.showHelp) {
    return null;
  }

  return (
    <ContainerSection label={`「${systemName}」の使い方`}>
      <RichText className="text-sm" text={helpMessage} />
    </ContainerSection>
  );
};
