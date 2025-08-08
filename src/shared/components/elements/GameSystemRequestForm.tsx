'use client';

import { t } from 'i18next';
import { type FC, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/components/ui/use-toast';
import { sendGameSystemRequest } from '@/shared/lib/webhook';

export const GameSystemRequestForm: FC = () => {
  const { toast } = useToast();
  const [system, setSystem] = useState('');
  const [logFile, setLogFile] = useState<File | null>(null);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendGameSystemRequest({ system, logFile });
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
    <form onSubmit={submitHandler}>
      <div className="text-lg font-bold">{t('analyze-logs:game-system-request:label')}</div>
      <div className="grid gap-4 py-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="request-form-system">{t('analyze-logs:game-system-request:system')}</Label>
            <Input
              id="request-form-name"
              value={system}
              onChange={(e) => {
                setSystem(e.currentTarget.value);
              }}
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
            <p className="text-xs text-slate-500">{t('analyze-logs:game-system-request:logs-description')}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit">{t('analyze-logs:game-system-request:submit')}</Button>
      </div>
    </form>
  );
};
