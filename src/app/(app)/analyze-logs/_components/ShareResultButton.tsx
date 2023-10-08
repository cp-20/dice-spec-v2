import { IconBrandX } from '@tabler/icons-react';
import type { FC } from 'react';
import { Button } from '@/shared/components/ui/button';

export const ShareResultButton: FC = () => {
  return (
    <Button variant="secondary" className="w-full">
      <IconBrandX />
      <span>解析結果をシェア</span>
    </Button>
  );
};
