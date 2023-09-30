import type { FC, ReactNode } from 'react';
import { Text } from '@/shared/components/Typography/Text';

export type StatsProps = {
  label?: ReactNode;
  number?: ReactNode;
  unit?: ReactNode;
};

export const Stats: FC<StatsProps> = ({ label, number, unit }) => {
  return (
    <div className="rounded-md border p-3">
      <Text className="text-xs font-bold text-slate-500">{label}</Text>
      <div className="mt-1">
        {number ? (
          <Text>
            <span className="text-xl">{number}</span>
            {unit && <span className="text-xs">{unit}</span>}
          </Text>
        ) : (
          <Text className="text-xl text-slate-400">-</Text>
        )}
      </div>
    </div>
  );
};
