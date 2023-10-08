'use client';

import type { ComponentProps, FC } from 'react';
import { DiceLog } from './DiceLog';
import { useCharacterLogAnalysis } from './hooks/useCharacterLogAnalysis';
import { ContainerSection } from '@/app/(app)/_components/ContainerSection';
import { useCharacterSelect } from '@/app/(app)/analyze-logs/_components/hooks/useCharacterSelect';

export const DiceLogList: FC<ComponentProps<'div'>> = ({ ...props }) => {
  const { character } = useCharacterSelect();
  const result = useCharacterLogAnalysis(character);

  return (
    <ContainerSection label="ダイスログ" {...props}>
      {result !== undefined &&
        result.diceResults.map((log, index) => (
          <DiceLog
            key={index}
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
