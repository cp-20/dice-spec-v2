import { t } from 'i18next';
import type { FC, ReactNode } from 'react';

import type { DiceResultForCharacter } from '@/features/log-analysis/model';
import { Stats } from '@/shared/components/elements/Stats';
import { round } from '@/shared/lib/round';

interface LogAnalysisStatsViewProps {
  result?: Pick<DiceResultForCharacter, 'summary'>;
}

export const LogAnalysisStatsView: FC<LogAnalysisStatsViewProps> = ({ result }) => {
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
