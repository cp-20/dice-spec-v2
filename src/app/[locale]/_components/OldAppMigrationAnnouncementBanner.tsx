'use client';

import { t } from 'i18next';
import { usePathname } from 'next/navigation';
import type { FC } from 'react';
import { Trans } from 'react-i18next';

export const OldAppMigrationAnnouncementBanner: FC = () => {
  const pathname = usePathname();
  return (
    <div className="bg-yellow-100 text-yellow-800 px-4 py-3 flex justify-center items-center gap-2" role="alert">
      <div className="flex-1 flex justify-center items-start gap-1">
        <span className="font-bold text-nowrap">{t('common:announcement.label')}: </span>
        <span className="text-pretty">
          <Trans
            i18nKey="common:announcement.oldAppMigration"
            values={{ target: 'dicespec.app' }}
            components={{
              target: (
                <a href={`https://dicespec.app${pathname}`} className="underline hover:opacity-70">
                  dicespec.app
                </a>
              ),
            }}
          />
        </span>
      </div>
    </div>
  );
};
