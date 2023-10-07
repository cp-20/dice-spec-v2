'use client';

import clsx from 'clsx';
import { type FC } from 'react';
import { ContainerSection } from '@/app/(app)/_components/ContainerSection';
import {
  useDiceLogs,
  type DiceLog,
} from '@/app/(app)/dice/_components/hooks/useDiceLogs';

export type DiceOutputProps = {
  logs: DiceLog[];
};

export const DiceOutput: FC = () => {
  const { diceLogs } = useDiceLogs();

  return <PresentialDiceOutput logs={diceLogs} />;
};

export const PresentialDiceOutput: FC<DiceOutputProps> = ({ logs }) => (
  <ContainerSection label="出力" scrollable className="h-40">
    <div>
      {logs.map((log) => (
        <div key={log.key} className="flex text-sm">
          <div>
            <span className="mr-2 text-slate-600">{log.system}</span>
            <span
              className={clsx(
                log.variant === 'success' && 'text-blue-500',
                log.variant === 'failed' && 'text-red-600',
              )}
            >
              {log.log}
            </span>
          </div>
        </div>
      ))}
    </div>
  </ContainerSection>
);
