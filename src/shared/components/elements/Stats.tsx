import type { FC, ReactNode } from 'react';
import { Text } from '@/shared/components/Typography/Text';

type StatsProps = {
  label?: ReactNode;
  number?: ReactNode;
  unit?: ReactNode;
  small?: ReactNode;
};

export const Stats: FC<StatsProps> = ({ label, number, unit, small }) => {
  return (
    <div className="rounded-md border p-3">
      <Text className="text-xs font-bold text-slate-500">{label}</Text>
      <div className="mt-1">
        {number !== undefined && !Number.isNaN(number) ? (
          <Text>
            <span className="text-xl">{number}</span>
            {unit && <span className="text-xs">{unit}</span>}
            {small && <span className="text-xs text-slate-500 ml-1">/ {small}</span>}
          </Text>
        ) : (
          <Text className="text-xl text-slate-500">-</Text>
        )}
      </div>
    </div>
  );
};
