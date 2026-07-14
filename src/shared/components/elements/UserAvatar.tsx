import { IconUserFilled } from '@tabler/icons-react';
import type { FC } from 'react';

import { Skeleton } from '@/shared/components/ui/skeleton';

interface UserAvatarProps {
  avatarUrl?: string;
  loading?: boolean;
  size: number;
}

export const UserAvatar: FC<UserAvatarProps> = ({ avatarUrl, loading = false, size }) => {
  if (loading) {
    return <Skeleton className="rounded-full" style={{ width: size, height: size }} />;
  }

  const iconSize = Math.max(12, Math.floor(size / 1.5));

  return (
    <div
      className="relative overflow-hidden rounded-full border-2 border-slate-300 bg-slate-200"
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        // oxlint-disable-next-line nextjs/no-img-element 外部URLの画像を表示するため、imgタグを使用 (そしてアップロード時に圧縮されているはず)
        <img src={avatarUrl} alt="" className="size-full object-cover" width={size * 4} height={size * 4} />
      ) : (
        <div className="flex size-full items-center justify-center bg-slate-200">
          <IconUserFilled className="text-slate-500" style={{ width: iconSize, height: iconSize }} />
        </div>
      )}
    </div>
  );
};
