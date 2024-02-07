'use client';

import { t } from 'i18next';
import type { FC, ReactNode } from 'react';
import { useCharacterLogAnalysis } from './hooks/useCharacterLogAnalysis';
import { useCharacterSelect } from './hooks/useCharacterSelect';
import { Stats } from '@/shared/components/elements/Stats';
import { round } from '@/shared/lib/round';

export const LogAnalysisStats: FC = () => {
  const { character } = useCharacterSelect();
  const result = useCharacterLogAnalysis(character);

  const numberWrapper = (number: ReactNode) =>
    result ? number : <span className="text-slate-500">-</span>;

  return (
    <div className="@container">
      <div className="grid grid-cols-2 gap-4 @lg:grid-cols-4">
        <Stats
          label={t('analyze-logs:stats.mean')}
          number={numberWrapper(
            result && round(result.diceResultSummary.average, 2),
          )}
        />
        <Stats
          label={t('analyze-logs:stats.deviation')}
          number={numberWrapper(
            result && round(result.diceResultSummary.deviationScore, 2),
          )}
        />
        <Stats
          label={t('analyze-logs:stats.success-rate')}
          number={numberWrapper(
            result && round(result.diceResultSummary.successRate, 2),
          )}
          unit={result ? '%' : null}
        />
        <Stats
          label={t('analyze-logs:stats.roll-count')}
          number={numberWrapper(result?.diceResultSummary.diceRollCount)}
          unit={result ? t('analyze-logs:stats.roll-count-unit') : null}
        />
      </div>
    </div>
  );
};
