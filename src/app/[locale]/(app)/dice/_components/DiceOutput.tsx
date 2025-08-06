'use client';

import clsx from 'clsx';
import { t } from 'i18next';
import type { FC } from 'react';
import { ContainerSection } from '@/app/[locale]/(app)/_components/ContainerSection';
import { type DiceLog, useDiceLogs } from './hooks/useDiceLogs';

export type DiceOutputProps = {
  logs: DiceLog[];
};

export const DiceOutput: FC = () => {
  const { diceLogs } = useDiceLogs();

  return <PresentialDiceOutput logs={diceLogs} />;
};

export const PresentialDiceOutput: FC<DiceOutputProps> = ({ logs }) => (
  <ContainerSection label={t('dice:advanced.output')} scrollable className="h-40">
    <div>
      {logs.map((log) => (
        <div key={log.key} className="flex text-sm">
          <div>
            <span className="mr-2 text-slate-600">{log.system}</span>
            <span
              className={clsx(log.variant === 'success' && 'text-blue-500', log.variant === 'failed' && 'text-red-600')}
            >
              {log.log}
            </span>
          </div>
        </div>
      ))}
    </div>
  </ContainerSection>
);
