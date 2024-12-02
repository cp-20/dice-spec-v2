'use client';

import { IconX } from '@tabler/icons-react';
import { t } from 'i18next';
import { atom } from 'jotai';
import { useCallback, type FC } from 'react';
import * as v from 'valibot';
import { Button } from '@/shared/components/ui/button';
import { useLocalStorageAtom } from '@/shared/lib/useLocalStorage';

const showUpdateAnnouncementAtom = atom(false);

export const UpdateAnnouncement: FC = () => {
  const [show, setShow] = useLocalStorageAtom(
    'show-update-announcement',
    showUpdateAnnouncementAtom,
    v.boolean(),
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
        <span>{t('common:update-announcement.label')}</span>
        <a
          href="https://v1-dicespec.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80"
        >
          {t('common:update-announcement.v1')}
        </a>
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
