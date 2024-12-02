'use client';

import { t } from 'i18next';
import type { ComponentProps, FC } from 'react';
import { DiceLog } from './DiceLog';
import { useCharacterLogAnalysis } from './hooks/useCharacterLogAnalysis';
import { useCharacterSelect } from './hooks/useCharacterSelect';
import { ContainerSection } from '@/app/[locale]/(app)/_components/ContainerSection';

export const DiceLogList: FC<ComponentProps<'div'>> = ({ ...props }) => {
  const { character } = useCharacterSelect();
  const result = useCharacterLogAnalysis(character);

  return (
    <ContainerSection label={t('analyze-logs:log')} {...props}>
      {result?.diceResults.map((log) => (
        <DiceLog
          key={`${log.diceFullStr}-${log.diceResult}-${log.diceResultNumber}-${log.diceTarget}`}
          log={{
            success: log.success,
            failure: log.failure,
            value: log.diceFullStr,
          }}
        />
      ))}
    </ContainerSection>
  );
};
