import { IconChartBar } from '@tabler/icons-react';
import type { FC } from 'react';

export const ExpectResultChart: FC = () => {
  return (
    <div className="flex items-center justify-center gap-2 rounded-md border p-8">
      <IconChartBar />
      <div className="text-xl">ここにグラフ</div>
    </div>
  );
};
