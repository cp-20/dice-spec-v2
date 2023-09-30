'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { IconRestore } from '@tabler/icons-react';
import type { FC } from 'react';
import { useForm } from 'react-hook-form';

import type { Output } from 'valibot';
import {
  boolean,
  maxValue,
  minValue,
  number,
  object,
  string,
  url,
} from 'valibot';
import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Slider } from '@/shared/components/ui/slider';
import { Switch } from '@/shared/components/ui/switch';
import { bcdiceApiEndpoint } from '@/shared/lib/const';

const FormSchema = object({
  showHelp: boolean(),
  playSound: boolean(),
  volume: number([minValue(0), maxValue(100)]),
  bcdiceApiEndpoint: string([url()]),
});

type FormSchemaType = Output<typeof FormSchema>;

export const AdvancedSettingsContent: FC = () => {
  const form = useForm<FormSchemaType>({
    resolver: valibotResolver(FormSchema),
    defaultValues: {
      showHelp: true,
      playSound: false,
      volume: 50,
      bcdiceApiEndpoint,
    },
  });

  const onSubmit = (data: FormSchemaType) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-4">
        <div className="grid grid-cols-2">
          <FormField
            control={form.control}
            name="showHelp"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>ヘルプを表示する</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="playSound"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>サウンドを再生する</FormLabel>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="volume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>音量</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]}
                  min={0}
                  max={100}
                  onValueChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bcdiceApiEndpoint"
          render={({ field, formState }) => (
            <FormItem>
              <FormLabel>使用するBCDiceAPIサーバー</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    className="pr-[3.25rem]"
                    placeholder={bcdiceApiEndpoint}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:slate-100 absolute right-0 top-0 bg-slate-50"
                  onClick={() =>
                    field.onChange(formState.defaultValues?.bcdiceApiEndpoint)
                  }
                >
                  <IconRestore />
                </Button>
              </div>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
