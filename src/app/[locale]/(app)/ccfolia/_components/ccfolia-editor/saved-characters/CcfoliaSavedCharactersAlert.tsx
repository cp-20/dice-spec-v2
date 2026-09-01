'use client';

import { IconAlertTriangle } from '@tabler/icons-react';
import { t } from 'i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import type { FC } from 'react';

import { Button } from '@/shared/components/ui/button';

import {
  continueAsNewAtom,
  loadLatestCharacterAtom,
  remoteConflictAtom,
  selectedCharacterQueryAtom,
} from './savedCharacters';

export const CcfoliaSavedCharactersAlert: FC = () => {
  const remoteConflict = useAtomValue(remoteConflictAtom);
  const selectedRemoteCharacter = useAtomValue(selectedCharacterQueryAtom).character;
  const loadLatestCharacter = useSetAtom(loadLatestCharacterAtom);
  const continueAsNew = useSetAtom(continueAsNewAtom);

  if (!remoteConflict) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="space-y-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm"
    >
      <div className="flex gap-2">
        <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-medium">{t('ccfolia:saved.conflict-title')}</p>
          <p>{t(`ccfolia:saved.conflict-${remoteConflict}`)}</p>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {remoteConflict === 'updated' && selectedRemoteCharacter && (
          <Button type="button" variant="outline" size="sm" onClick={loadLatestCharacter}>
            {t('ccfolia:saved.discard-and-load-latest')}
          </Button>
        )}
        <Button type="button" variant="secondary" size="sm" onClick={continueAsNew}>
          {t('ccfolia:saved.continue-as-new')}
        </Button>
      </div>
    </div>
  );
};
