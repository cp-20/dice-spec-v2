'use client';

import { t } from 'i18next';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useToast } from '@/shared/components/ui/use-toast';
import { sendFeedback } from '@/shared/lib/webhook';

export const FeedbackForm = () => {
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState('');
  const { toast } = useToast();

  const feedbackSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      sendFeedback({
        name: e.currentTarget['feedback-form-name'].value,
        feedback: e.currentTarget['feedback-form-feedback'].value,
      });
      toast({
        title: t('common:header.feedback.submitted'),
        description: t('common:header.feedback.submitted-description'),
        variant: 'default',
      });
    } catch (_err) {
      toast({
        title: t('common:header.feedback.error'),
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={feedbackSubmitHandler}>
      <div>
        <div className="text-lg font-bold">{t('common:header.feedback.title')}</div>
        <div className="text-sm text-gray-500 mt-1 mb-2">{t('common:header.feedback.description')}</div>
      </div>
      <div className="grid gap-4 py-4">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="feedback-form-name">{t('common:header.feedback.name')}</Label>
            <Input id="feedback-form-name" value={name} onChange={(e) => setName(e.currentTarget.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="feedback-form-feedback">{t('common:header.feedback.feedback')}</Label>
            <Textarea
              id="feedback-form-feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.currentTarget.value)}
              // @ts-expect-error fieldSizing is a newer CSS property
              style={{ fieldSizing: 'content' }}
              required
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit">{t('common:header.feedback.submit')}</Button>
      </div>
    </form>
  );
};
