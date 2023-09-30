import { type FC } from 'react';
import { ContainerSection } from '@/app/(app)/_components/ContainerSection';

export type DiceLog = {
  system: string;
  result: string;
  timestamp: number;
};

export type DiceOutputProps = {
  logs: DiceLog[];
};

export const DiceOutput: FC<DiceOutputProps> = ({ logs }) => (
  <ContainerSection label="出力" scrollable>
    <div>
      {logs.map((log) => (
        <div key={log.timestamp} className="flex justify-between text-sm">
          <div>
            <span className="mr-2 text-slate-600">{log.system}</span>
            <span>{log.result}</span>
          </div>
          <div className="text-slate-400">{formatDate(log.timestamp)}</div>
        </div>
      ))}
    </div>
  </ContainerSection>
);

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};
