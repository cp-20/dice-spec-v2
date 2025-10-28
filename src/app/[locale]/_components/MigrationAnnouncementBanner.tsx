'use client';

import { IconX } from '@tabler/icons-react';
import { t } from 'i18next';
import { atom } from 'jotai';
import { type FC, useCallback } from 'react';
import { Trans } from 'react-i18next';
import * as v from 'valibot';
import { Button } from '@/shared/components/ui/button';
import { useLocalStorageAtom } from '@/shared/lib/useLocalStorage';

const showMigrationAnnouncementAtom = atom(false);

export const MigrationAnnouncementBanner: FC = () => {
  const [show, setShow] = useLocalStorageAtom(
    'show-migration-announcement',
    showMigrationAnnouncementAtom,
    v.boolean(),
    true,
  );

  const handleClose = useCallback(() => {
    setShow(false);
  }, [setShow]);

  if (!show) return null;

  return (
    <div className="bg-slate-200 text-slate-600 px-4 py-3 flex justify-center items-center gap-2" role="alert">
      <div className="flex-1 flex justify-center items-start gap-1">
        <span className="font-bold text-nowrap">{t('common:announcement.label')}: </span>
        <span className="text-pretty">
          <Trans
            i18nKey="common:announcement.migration"
            values={{ target: 'dicespec.app' }}
            components={{
              target: (
                <a href="https://dicespec.app" className="underline hover:opacity-70">
                  dicespec.app
                </a>
              ),
            }}
          ></Trans>
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="max-sm:size-6"
        onClick={handleClose}
        aria-label={t('common:announcement.close')}
      >
        <IconX className="max-sm:size-4" />
      </Button>
    </div>
  );
};
