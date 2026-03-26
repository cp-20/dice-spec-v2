import { IconUserFilled } from '@tabler/icons-react';
import type { FC } from 'react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useMeStore, useUserStore } from '@/shared/lib/firebase/stores/userStore';

interface MyAvatarProps {
  size: number;
}

export const MyAvatar: FC<MyAvatarProps> = ({ size }) => {
  const { me } = useMeStore();

  if (me === null) {
    return <Skeleton className="rounded-full" style={{ width: size, height: size }} />;
  }

  return <PresentialUserAvatar avatarUrl={me.avatarUrl} size={size} />;
};

interface UserAvatarProps {
  uid?: string | null | undefined;
  size: number;
}

export const UserAvatar: FC<UserAvatarProps> = ({ uid, size }) => {
  const user = useUserStore(uid);

  return <PresentialUserAvatar avatarUrl={user?.avatarUrl} size={size} />;
};

interface PresentialUserAvatarProps {
  avatarUrl: string | undefined;
  size: number;
}

const PresentialUserAvatar: FC<PresentialUserAvatarProps> = ({ avatarUrl, size }) => {
  const iconSize = Math.max(12, Math.floor(size / 1.5));

  return (
    <div
      className="relative overflow-hidden rounded-full border-2 border-slate-300 bg-slate-200"
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        // biome-ignore lint/performance/noImgElement: external image
        <img src={avatarUrl} alt="" className="size-full object-cover" width={size * 4} height={size * 4} />
      ) : (
        <div className="flex size-full items-center justify-center bg-slate-200">
          <IconUserFilled className="text-slate-500" style={{ width: iconSize, height: iconSize }} />
        </div>
      )}
    </div>
  );
};
