'use client';

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
          label="平均"
          number={numberWrapper(
            result && round(result.diceResultSummary.average, 2),
          )}
        />
        <Stats
          label="ダイス偏差値"
          number={numberWrapper(
            result && round(result.diceResultSummary.deviationScore, 2),
          )}
        />
        <Stats
          label="成功率"
          number={numberWrapper(
            result && round(result.diceResultSummary.successRate, 2),
          )}
          unit={result ? '%' : null}
        />
        <Stats
          label="ダイスを振った回数"
          number={numberWrapper(result?.diceResultSummary.diceRollCount)}
          unit={result ? '回' : null}
        />
      </div>
    </div>
  );
};
