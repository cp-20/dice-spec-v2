'use client';

import { IconX } from '@tabler/icons-react';
import { atom } from 'jotai';
import Link from 'next/link';
import { useCallback, type FC } from 'react';
import { boolean } from 'valibot';
import { Button } from '@/shared/components/ui/button';
import { useLocalStorageAtom } from '@/shared/lib/useLocalStorage';

const showUpdateAnnouncementAtom = atom(false);

export const UpdateAnnouncement: FC = () => {
  const [show, setShow] = useLocalStorageAtom(
    'show-update-announcement',
    showUpdateAnnouncementAtom,
    boolean(),
    true,
  );

  const handleClose = useCallback(() => {
    setShow(false);
  }, [setShow]);

  if (!show) {
    return null;
  }

  return (
    <div className="space-between flex items-center bg-slate-200 p-4 py-2 max-sm:p-2">
      <div className="max-sm: flex flex-1 flex-wrap justify-center max-sm:text-sm">
        <span>ダイススペックはv2にアップデートされました。</span>
        <Link
          href="https://v1.dicespec.vercel.app"
          className="underline hover:opacity-80"
        >
          もとのv1はここからアクセスできます。
        </Link>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="max-sm:h-6 max-sm:w-6"
        onClick={handleClose}
      >
        <IconX className="max-sm:h-4 max-sm:w-4" />
      </Button>
    </div>
  );
};
