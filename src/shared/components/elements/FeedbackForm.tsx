'use client';

import { type ReactNode, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useToast } from '@/shared/components/ui/use-toast';
import { captureClientException } from '@/shared/lib/sentryClient';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';
import { sendFeedback } from '@/shared/lib/webhook';

export const FeedbackForm = ({ header, onSubmitted }: { header?: ReactNode; onSubmitted?: () => void }) => {
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState('');
  const { toast } = useToast();
  const { sendEvent } = useGoogleAnalytics();

  const feedbackSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendFeedback({
        name: e.currentTarget['feedback-form-name'].value,
        feedback: e.currentTarget['feedback-form-feedback'].value,
      });
      toast({
        title: 'フィードバックを送信しました！',
        description: 'フィードバックを送信していただきありがとうございます！',
        variant: 'default',
      });
      sendEvent('submit_feedback');
      onSubmitted?.();
    } catch (err) {
      console.error('Failed to send feedback', err);
      captureClientException(err);
      toast({
        title: 'フィードバックの送信に失敗しました',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={feedbackSubmitHandler}>
      {header ?? (
        <div>
          <div className="text-lg font-bold">フィードバック</div>
          <div className="text-sm text-slate-500 mt-1 mb-2">
            「ここをこういう風に改善して欲しい！」「なんかバグった」「この機能が欲しい！」といったフィードバックをお寄せください
            (なるべく具体的に書いてもらえると嬉しいです！)
          </div>
        </div>
      )}
      <div className="grid gap-4 py-4">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="feedback-form-name">名前 (任意)</Label>
            <Input id="feedback-form-name" value={name} onChange={(e) => setName(e.currentTarget.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="feedback-form-feedback">フィードバック</Label>
            <Textarea
              id="feedback-form-feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.currentTarget.value)}
              required
              className="field-sizing-content"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit">送信</Button>
      </div>
    </form>
  );
};
