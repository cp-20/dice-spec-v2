'use client';

import { IconLoader2 } from '@tabler/icons-react';
import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useDeleteAnalysis } from '@/shared/lib/firebase/stores/analyses/mutations';

import { analysisIdAtom } from './atoms';

export const useDeleteAnalysisDialog = () => {
  const analysisId = useAtomValue(analysisIdAtom);
  const [isOpen, setIsOpen] = useState(false);
  const { deleteAnalysis, deleting } = useDeleteAnalysis();
  const router = useRouter();

  const handleDelete = async () => {
    if (!analysisId) return;
    await deleteAnalysis(analysisId);
    router.push(t('link', { href: '/analyze-logs/list' }));
  };

  const open = () => setIsOpen(true);

  const close = () => setIsOpen(false);

  const render = () => (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('analyze-logs:delete-dialog.title')}</DialogTitle>
          <DialogDescription>{t('analyze-logs:delete-dialog.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={deleting}>
            {t('analyze-logs:delete-dialog.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>{t('analyze-logs:delete-dialog.deleting')}</span>
              </>
            ) : (
              <>{t('analyze-logs:delete-dialog.delete')}</>
            )}{' '}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { open, close, render };
};
