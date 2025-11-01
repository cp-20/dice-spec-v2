'use client';

import { t } from 'i18next';
import type { FC, ReactNode } from 'react';
import { Stats } from '@/shared/components/elements/Stats';
import { round } from '@/shared/lib/round';
import { useCharacterLogAnalysis } from './hooks/useCharacterLogAnalysis';
import { useCharacterSelect } from './hooks/useCharacterSelect';

export const LogAnalysisStats: FC = () => {
  const { character } = useCharacterSelect();
  const result = useCharacterLogAnalysis(character);

  const numberWrapper = (number: ReactNode) => result && number;

  return (
    <div className="@container">
      <div className="flex flex-col gap-4">
        <Stats
          label={t('analyze-logs:stats.mean')}
          number={numberWrapper(result && round(result.summary.average, 2))}
        />
        <Stats
          label={t('analyze-logs:stats.success-rate')}
          number={numberWrapper(result && round(result.summary.successRate, 2))}
          unit="%"
        />
        <Stats
          label={t('analyze-logs:stats.roll-count')}
          number={numberWrapper(result?.summary.diceRollCount)}
          unit={t('analyze-logs:stats.roll-count-unit')}
          small={
            result?.summary.diceCount !== result?.summary.diceRollCount &&
            `${result?.summary.diceCount}${t('analyze-logs:stats.dice-count-unit')}`
          }
        />
      </div>
    </div>
  );
};
