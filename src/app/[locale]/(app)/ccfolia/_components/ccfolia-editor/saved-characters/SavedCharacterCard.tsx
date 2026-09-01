'use client';

import { IconCheck, IconClipboard, IconLoader2, IconPlus, IconTrash } from '@tabler/icons-react';
import { t } from 'i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import { type FC, useId, useState } from 'react';

import type { CcfoliaCharacterDocument } from '@/features/ccfolia/model';
import { ActionButtonFeedback } from '@/shared/components/ui/action-button-feedback';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/shadcn-utils';

import { useTimedFeedback } from '../useTimedFeedback';
import {
  canCreateSavedCharacterAtom,
  deleteCharacterAtom,
  exportCharacterAtom,
  resetToNewAtom,
  selectCharacterAtom,
  selectionAtom,
} from './savedCharacters';

type SavedCharacterCardProps = {
  character: CcfoliaCharacterDocument;
};

export const SavedCharacterCard: FC<SavedCharacterCardProps> = ({ character }) => {
  const nameId = useId();
  const selected = useAtomValue(selectionAtom).characterId === character.id;
  const selectCharacter = useSetAtom(selectCharacterAtom);
  const exportCharacter = useSetAtom(exportCharacterAtom);
  const deleteCharacter = useSetAtom(deleteCharacterAtom);
  const { visible: exported, show: showExported } = useTimedFeedback(1_500);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const updatedAt = character.updatedAt.toDate().toLocaleString(t('date-locale'), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      if (await exportCharacter(character)) showExported();
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCharacter(character);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article
      aria-labelledby={nameId}
      className={cn(
        'flex min-h-32 flex-col overflow-hidden rounded-lg border bg-card',
        selected && 'border-primary/20 bg-muted/30',
      )}
    >
      <button
        type="button"
        className="flex flex-1 flex-col items-start gap-1.5 p-3 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        onClick={() => selectCharacter(character.id)}
        aria-pressed={selected}
      >
        <span className="flex w-full items-start justify-between gap-2">
          <span id={nameId} className="line-clamp-2 min-w-0 wrap-break-word font-semibold" title={character.name}>
            {character.name}
          </span>
          {selected && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {t('ccfolia:saved.editing')}
            </span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">{t('ccfolia:saved.updated-at', { updatedAt })}</span>
      </button>

      <div className="grid grid-cols-2 border-t">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-none border-r"
          onClick={() => void handleExport()}
          disabled={exporting}
          aria-label={t(exported ? 'ccfolia:saved.exported-character' : 'ccfolia:saved.export-character', {
            name: character.name,
          })}
        >
          <ActionButtonFeedback
            state={exporting ? 'pending' : exported ? 'success' : 'idle'}
            idle={
              <>
                <IconClipboard className="size-4" />
                {t('ccfolia:saved.export')}
              </>
            }
            pending={
              <>
                <IconLoader2 className="size-4 animate-spin" />
                {t('ccfolia:saved.export')}
              </>
            }
            success={
              <>
                <IconCheck className="size-4" />
                {t('ccfolia:saved.exported')}
              </>
            }
          />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'rounded-none text-red-700 hover:text-red-700 dark:text-red-400 dark:hover:text-red-400',
            deleting && 'disabled:opacity-100',
          )}
          onClick={() => void handleDelete()}
          disabled={deleting}
          aria-label={t('ccfolia:saved.delete-character', { name: character.name })}
        >
          {deleting ? <IconLoader2 className="size-4 animate-spin" /> : <IconTrash className="size-4" />}
          {deleting ? t('ccfolia:saved.deleting') : t('ccfolia:saved.delete')}
        </Button>
      </div>
      {exported && (
        <output className="sr-only" aria-live="polite">
          {t('ccfolia:saved.exported-announcement', { name: character.name })}
        </output>
      )}
    </article>
  );
};

export const NewCharacterCard: FC = () => {
  const canCreate = useAtomValue(canCreateSavedCharacterAtom);
  const resetToNew = useSetAtom(resetToNewAtom);

  return (
    <button
      type="button"
      className="flex min-h-32 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-muted/10 p-3 text-center outline-none transition-colors hover:border-primary/60 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
      onClick={resetToNew}
    >
      <span className="grid size-8 place-items-center rounded-full bg-muted">
        <IconPlus className="size-4" />
      </span>
      <span className="font-semibold">{t('ccfolia:saved.new')}</span>
      <span className="text-xs text-muted-foreground">
        {canCreate ? t('ccfolia:saved.new-description') : t('ccfolia:saved.new-limit-reached')}
      </span>
    </button>
  );
};
