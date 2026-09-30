'use client';

import { IconMessageReply } from '@tabler/icons-react';
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
        <Button variant="outline" size="icon" className="size-8" title="フィードバック">
          <IconMessageReply className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <FeedbackForm
          onSubmitted={() => setOpen(false)}
          header={
            <DialogHeader>
              <DialogTitle>フィードバック</DialogTitle>
              <DialogDescription>
                「ここをこういう風に改善して欲しい！」「なんかバグった」「この機能が欲しい！」といったフィードバックをお寄せください
                (なるべく具体的に書いてもらえると嬉しいです！)
              </DialogDescription>
            </DialogHeader>
          }
        />
      </DialogContent>
    </Dialog>
  );
};
