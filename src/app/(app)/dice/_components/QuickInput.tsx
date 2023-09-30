import { IconStar, IconStarFilled } from '@tabler/icons-react';
import type { FC } from 'react';
import { Button } from '@/shared/components/ui/button';

export type QuickInputItem = {
  isFavorite: boolean;
  value: string;
};

export type QuickInputProps = {
  items: QuickInputItem[];
};

export const QuickInput: FC<QuickInputProps> = ({ items }) => (
  <div className="flex gap-2">
    {items.map((item) => (
      <div key={item.value} className="flex">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-e-none border-r-0"
        >
          {item.isFavorite ? (
            <IconStarFilled size="16" />
          ) : (
            <IconStar size="16" />
          )}
        </Button>
        <Button variant="outline" className="h-8 rounded-s-none px-3">
          {item.value}
        </Button>
      </div>
    ))}
  </div>
);
