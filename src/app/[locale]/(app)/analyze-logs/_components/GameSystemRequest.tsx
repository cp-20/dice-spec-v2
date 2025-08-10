'use client';

import { t } from 'i18next';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/components/ui/use-toast';
import { sendGameSystemRequest } from '@/shared/lib/webhook';

export const useGameSystemRequestDialog = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [system, setSystem] = useState('');
  const [logFile, setLogFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = (value: string) => {
    if (/(CoC|クトゥルフ|エモクロア|シノビガミ)/.test(value)) {
      setErrorMessage(t('analyze-logs:game-system-request:already-implemented'));
    } else {
      setErrorMessage(null);
    }
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendGameSystemRequest({ system, logFile });
      setIsOpen(false);
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

  const render = () => (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                  onChange={(e) => {
                    setSystem(e.currentTarget.value);
                    validate(e.currentTarget.value);
                  }}
                  required
                />
                {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="request-form-logs">{t('analyze-logs:game-system-request:logs')}</Label>
                <Input
                  id="request-form-logs"
                  type="file"
                  accept="text/html"
                  onChange={(e) => setLogFile(e.currentTarget.files?.[0] ?? null)}
                />
                <p className="text-xs text-slate-500">{t('analyze-logs:game-system-request:logs-description')}</p>
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

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return { open, close, render };
};
