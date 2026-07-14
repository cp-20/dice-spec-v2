'use client';

import { IconMessageReply } from '@tabler/icons-react';
import { t } from 'i18next';
import { useState } from 'react';

import { FeedbackForm } from '@/shared/components/elements/FeedbackForm';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';

export const FeedbackDialog = () => {
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="size-8" title={t('common:header.feedback-button')}>
          <IconMessageReply className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <FeedbackForm
          onSubmitted={() => setOpen(false)}
          header={
            <DialogHeader>
              <DialogTitle>{t('common:header.feedback.title')}</DialogTitle>
              <DialogDescription>{t('common:header.feedback.description')}</DialogDescription>
            </DialogHeader>
          }
        />
      </DialogContent>
    </Dialog>
  );
};
