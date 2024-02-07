'use client';

import { IconCheck, IconClipboard } from '@tabler/icons-react';
import clsx from 'clsx';
import { t } from 'i18next';
import { useCallback, type FC, useState } from 'react';
import {
  array,
  number,
  object,
  optional,
  parse,
  string,
  transform,
} from 'valibot';
import { InputFormSchema, useInputForm } from './hooks/useInputForm';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/use-toast';

export const InputFormValueSchema = object({
  ...InputFormSchema.entries,
  status: array(
    transform(
      object({
        label: string(),
        value: optional(number()),
        max: optional(number()),
      }),
      (value) => ({
        ...value,
        key: Date.now().toString(36) + Math.random().toString(36).slice(2),
      }),
    ),
  ),
  params: array(
    transform(
      object({
        label: string(),
        value: string(),
      }),
      (value) => ({
        ...value,
        key: Date.now().toString(36) + Math.random().toString(36).slice(2),
      }),
    ),
  ),
});

export const LoadClipboardButton: FC = () => {
  const { form } = useInputForm();
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const handleCopyFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const json = parse(InputFormValueSchema, JSON.parse(text));
      form.reset(json);

      setDone(true);
      const timeout = setTimeout(() => setDone(false), 1000);
      return () => {
        setDone(false);
        clearTimeout(timeout);
      };
    } catch (err) {
      toast({
        title: t('ccfolia:load-clipboard.error'),
        description: t('ccfolia:load-clipboard.error-description'),
        variant: 'destructive',
      });
    }
  }, [form, toast]);

  return (
    <Button
      variant="secondary"
      className="inline-fle relative w-full flex-col gap-2 overflow-y-clip"
      onClick={handleCopyFromClipboard}
    >
      {done && (
        <IconCheck className="absolute animate-popup opacity-0 delay-150" />
      )}
      <div
        className={clsx(
          'flex items-center gap-2',
          !done && 'animate-slide-in-top',
          done && 'animate-slide-out-bottom',
        )}
      >
        <IconClipboard />
        <span>{t('ccfolia:load-clipboard.button')}</span>
      </div>
    </Button>
  );
};
