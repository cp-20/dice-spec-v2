'use client';

import { IconLoader2 } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useDeleteAnalysis } from '@/features/log-analysis/firebase/mutations';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useToast } from '@/shared/components/ui/use-toast';
import { captureClientException } from '@/shared/lib/sentryClient';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

import { analysisIdAtom } from './atoms';

export const useDeleteAnalysisDialog = () => {
  const analysisId = useAtomValue(analysisIdAtom);
  const [isOpen, setIsOpen] = useState(false);
  const { deleteAnalysis, deleting } = useDeleteAnalysis();
  const router = useRouter();
  const { toast } = useToast();
  const { sendEvent } = useGoogleAnalytics();

  const handleDelete = async () => {
    if (!analysisId) return;
    try {
      await deleteAnalysis(analysisId);
      sendEvent('delete_analysis');
      router.push('/analyze-logs/list');
    } catch (error) {
      console.error(error);
      captureClientException(error);
      toast({ title: '解析結果を削除できませんでした', variant: 'destructive' });
    }
  };

  const open = () => setIsOpen(true);

  const close = () => setIsOpen(false);

  const render = () => (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>解析結果を削除</DialogTitle>
          <DialogDescription>この操作は取り消せません。本当に削除しますか？</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={deleting}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>削除中</span>
              </>
            ) : (
              <>削除</>
            )}{' '}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { open, close, render };
};
