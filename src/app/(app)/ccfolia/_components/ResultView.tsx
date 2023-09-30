import { IconClipboard } from '@tabler/icons-react';
import type { FC } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';

export const ResultView: FC = () => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-bold">出力結果</div>
      <Textarea
        value={
          '{"kind":"character","data":{"name":"","memo":"","initiative":0,"externalUrl":"","status":[],"params":[],"color":"#888888","commands":""}}'
        }
        readOnly
      />
      <Button variant="secondary" className="inline-flex w-full gap-2">
        <IconClipboard />
        <span>クリップボードにコピー</span>
      </Button>
    </div>
  );
};
