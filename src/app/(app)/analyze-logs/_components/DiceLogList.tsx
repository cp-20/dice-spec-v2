import type { ComponentProps, FC } from 'react';
import { ContainerSection } from '@/app/(app)/_components/ContainerSection';
import {
  DiceLog,
  type DiceLogType,
} from '@/app/(app)/analyze-logs/_components/DiceLog';

export type DiceLogListProps = {
  logs: DiceLogType[];
};

export const DiceLogList: FC<ComponentProps<'div'> & DiceLogListProps> = ({
  logs,
  ...props
}) => {
  return (
    <ContainerSection label="ダイスログ" {...props}>
      {logs.map((log, index) => (
        <DiceLog key={index} log={log} />
      ))}
    </ContainerSection>
  );
};
