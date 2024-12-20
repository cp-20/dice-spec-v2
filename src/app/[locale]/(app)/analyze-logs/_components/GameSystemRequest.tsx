'use client';

import { Button } from '@/shared/components/ui/button';
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/components/ui/use-toast';
import { sendGameSystemRequest } from '@/shared/lib/webhook';
import { IconMessageReply } from '@tabler/icons-react';
import { t } from 'i18next';
import { useState, type FC } from 'react';

export const GameSystemRequest: FC = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [system, setSystem] = useState('');
  const [logFile, setLogFile] = useState<File | null>(null);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendGameSystemRequest({ system, logFile });
      setOpen(false);
      toast({
        title: t('analyze-logs:game-system-request:submitted'),
        description: t('analyze-logs:game-system-request:submitted-description'),
        variant: 'default',
      });
    } catch (err) {
      console.error(err);
      toast({
        title: t('analyze-logs:game-system-request:error'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)} className="flex gap-2 w-full">
          <IconMessageReply className="h-4 w-5 sm:h-5 sm:w-5" />
          <span>{t('analyze-logs:game-system-request:label')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={submitHandler}>
          <DialogHeader>
            <DialogTitle>{t('analyze-logs:game-system-request:label')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="request-form-system">{t('analyze-logs:game-system-request:system')}</Label>
                <Input
                  id="request-form-name"
                  value={system}
                  onChange={(e) => setSystem(e.currentTarget.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="request-form-logs">{t('analyze-logs:game-system-request:logs')}</Label>
                <Input
                  id="request-form-logs"
                  type="file"
                  accept="text/html"
                  onChange={(e) => setLogFile(e.currentTarget.files?.[0] ?? null)}
                />
                <p className="text-xs text-gray-500">{t('analyze-logs:game-system-request:logs-description')}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{t('analyze-logs:game-system-request:submit')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
