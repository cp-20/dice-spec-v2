import { FC, forwardRef, ReactNode } from 'react';
import { DiceResultForCharacter } from './hooks/ccfoliaLogAnalysis';
import { t } from 'i18next';
import { round } from '@/shared/lib/round';
import LogoIcon from '/public/icon.svg';
import { TitleLogo } from '@/shared/components/elements/TitleLogo';
import { LogAnalysisRankingChartView } from './LogAnalysisRankingChartView';

interface StatsProps {
  label: ReactNode;
  number: ReactNode;
  unit?: ReactNode;
  small?: ReactNode;
}

const Stats: FC<StatsProps> = ({ label, number, unit, small }) => {
  return (
    <div>
      <div className="text-slate-500 mb-1 font-bold text-xl">{label}</div>
      <div className="flex items-baseline">
        <span className="text-6xl font-bold text-slate-900">{number}</span>
        {unit && <span className="ml-1 text-2xl text-slate-700 font-bold">{unit}</span>}
        {small && <div className="text-xl text-slate-400 font-bold ml-2">{`/ ${small}`}</div>}
      </div>
    </div>
  );
};

interface Props {
  scenarioName?: string;
  analysisResult: Pick<DiceResultForCharacter, 'summary'>;
}

export const SharingAnalysisResultScreen = forwardRef<HTMLDivElement, Props>(
  ({ scenarioName, analysisResult }, ref) => {
    return (
      <div ref={ref} className="p-12 pl-24 bg-white aspect-1200/630 relative flex flex-col gap-20 w-full">
        <div className="text-4xl font-bold text-slate-900">
          {scenarioName || t('analyze-logs:share-analysis-result.scenario-name-default')}
        </div>

        <div className="flex gap-12 min-h-0 flex-1">
          <div className="space-y-8">
            <Stats label={t('analyze-logs:stats.mean')} number={round(analysisResult.summary.average, 2)} />
            <Stats
              label={t('analyze-logs:stats.success-rate')}
              number={round(analysisResult.summary.successRate, 2)}
              unit="%"
            />
            <Stats
              label={t('analyze-logs:stats.roll-count')}
              number={round(analysisResult.summary.diceRollCount, 2)}
              unit={t('analyze-logs:stats.roll-count-unit')}
              small={
                analysisResult.summary.diceCount !== analysisResult.summary.diceRollCount &&
                `${analysisResult.summary.diceCount}${t('analyze-logs:stats.dice-count-unit')}`
              }
            />
          </div>

          <div className="flex-1 space-y-4">
            <LogAnalysisRankingChartView score={analysisResult.summary.deviationScore} className="-mt-16" />
          </div>
        </div>
        <div className="flex items-center gap-1 justify-end absolute bottom-4 right-4">
          <LogoIcon className="size-8" />
          <TitleLogo className="h-6" />
        </div>
      </div>
    );
  },
);
