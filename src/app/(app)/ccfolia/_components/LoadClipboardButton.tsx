import { IconClipboard } from '@tabler/icons-react';
import type { FC } from 'react';
import { Button } from '@/shared/components/ui/button';

export const LoadClipboardButton: FC = () => (
  <Button variant="secondary" className="inline-flex w-full gap-2">
    <IconClipboard />
    <span>クリップボードから読み込み</span>
  </Button>
);
