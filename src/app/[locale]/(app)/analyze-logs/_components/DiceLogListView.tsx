import { t } from 'i18next';
import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { ContainerSection } from '@/app/[locale]/(app)/_components/ContainerSection';

interface LogResult {
  evaluationStatus: string;
  fullStr: string;
}

interface DiceLogListViewProps {
  results?: LogResult[];
}

export const DiceLogListView: FC<DiceLogListViewProps> = ({ results }) => {
  return (
    <ContainerSection label={t('analyze-logs:log')}>
      {results && results.length > 0 ? (
        <div className="space-y-1">
          {results.map((log, index) => (
            <DiceLog
              key={`${log.fullStr}-${index}`}
              log={{
                success: log.evaluationStatus === 'success',
                failure: log.evaluationStatus === 'failure',
                value: log.fullStr,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-500">{t('analyze-logs:detail.no-logs')}</div>
      )}
    </ContainerSection>
  );
};

type DiceLogType = {
  success: boolean;
  failure: boolean;
  value: string;
};

type DiceLogProps = {
  log: DiceLogType;
};

const DiceLog: FC<DiceLogProps & ComponentProps<'div'>> = ({ log, className, ...props }) => (
  <div
    className={twMerge('text-sm', log.success && 'text-blue-500', log.failure && 'text-red-600', className)}
    {...props}
  >
    {log.value}
  </div>
);
