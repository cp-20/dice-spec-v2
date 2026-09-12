'use client';

import { type FC, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/components/ui/use-toast';
import { captureClientException } from '@/shared/lib/sentryClient';
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
        title: 'リクエストを送信しました！',
        description: 'リクエストありがとうございます！',
        variant: 'default',
      });
    } catch (err) {
      console.error(err);
      captureClientException(err);
      toast({
        title: 'リクエストの送信に失敗しました',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={submitHandler}>
      <div className="text-lg font-bold">他ゲームシステム対応をリクエスト</div>
      <div className="grid gap-4 py-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="request-form-system">ゲームシステム名</Label>
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
            <Label htmlFor="request-form-logs">ログファイル (任意)</Label>
            <Input
              id="request-form-logs"
              type="file"
              accept="text/html"
              onChange={(e) => setLogFile(e.currentTarget.files?.[0] ?? null)}
            />
            <p className="text-xs text-slate-500">ログファイルがあると対応がしやすくなります！</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit">送信</Button>
      </div>
    </form>
  );
};
