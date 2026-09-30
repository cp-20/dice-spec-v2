import type { FC, ReactNode } from 'react';

import type { DiceResultForCharacter } from '@/features/log-analysis/model';
import { Stats } from '@/shared/components/elements/Stats';
import { round } from '@/shared/lib/round';

interface LogAnalysisStatsViewProps {
  result?: Pick<DiceResultForCharacter, 'summary'>;
}

export const LogAnalysisStatsView: FC<LogAnalysisStatsViewProps> = ({ result }) => {
  const numberWrapper = (number: ReactNode) => result && number;
  const evaluatedRollCount = result?.summary.evaluatedRollCount;
  const successRate = evaluatedRollCount === 0 ? undefined : result && round(result.summary.successRate, 2);
  const evaluatedRollCountLabel =
    evaluatedRollCount !== undefined && evaluatedRollCount !== result?.summary.diceRollCount
      ? `${evaluatedRollCount}回を評価`
      : undefined;

  return (
    <div className="@container">
      <div className="flex flex-col gap-4">
        <Stats label="平均" number={numberWrapper(result && round(result.summary.average, 2))} />
        <Stats label="成功率" number={numberWrapper(successRate)} unit="%" small={evaluatedRollCountLabel} />
        <Stats
          label="ダイスを振った回数"
          number={numberWrapper(result?.summary.diceRollCount)}
          unit="回"
          small={result?.summary.diceCount !== result?.summary.diceRollCount && `${result?.summary.diceCount}${'個'}`}
        />
      </div>
    </div>
  );
};
