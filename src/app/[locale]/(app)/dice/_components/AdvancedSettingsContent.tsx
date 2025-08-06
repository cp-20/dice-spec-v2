'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { IconRestore } from '@tabler/icons-react';
import { t } from 'i18next';
import { type FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import type { InferOutput } from 'valibot';
import * as v from 'valibot';
import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Slider } from '@/shared/components/ui/slider';
import { Switch } from '@/shared/components/ui/switch';
import { bcdiceApiEndpoint } from '@/shared/lib/const';
import { useAdvancedSettings } from './hooks/useAdvancedSettings';

export const AdvancedSettingsFormSchema = v.object({
  showHelp: v.boolean(),
  playSound: v.boolean(),
  volume: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  bcdiceApiEndpoint: v.pipe(v.string(), v.url()),
});

export type AdvancedSettings = InferOutput<typeof AdvancedSettingsFormSchema>;

export const AdvancedSettingsContent: FC = () => {
  const { advancedSettings, setAdvancedSettings } = useAdvancedSettings();
  const form = useForm<AdvancedSettings>({
    resolver: valibotResolver(AdvancedSettingsFormSchema),
    values: advancedSettings,
  });

  const watch = form.watch(['showHelp', 'playSound', 'volume', 'bcdiceApiEndpoint']);
  useEffect(() => {
    const [showHelp, playSound, volume, bcdiceApiEndpoint] = watch;
    if (
      showHelp !== advancedSettings.showHelp ||
      playSound !== advancedSettings.playSound ||
      volume !== advancedSettings.volume ||
      bcdiceApiEndpoint !== advancedSettings.bcdiceApiEndpoint
    ) {
      setAdvancedSettings({ showHelp, playSound, volume, bcdiceApiEndpoint });
    }
  }, [
    advancedSettings.bcdiceApiEndpoint,
    advancedSettings.playSound,
    advancedSettings.showHelp,
    advancedSettings.volume,
    setAdvancedSettings,
    watch,
  ]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => void 0)} className="space-y-8 p-4">
        <div className="grid grid-cols-2">
          <FormField
            control={form.control}
            name="showHelp"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>{t('dice:advanced.advanced-settings.show-help')}</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="playSound"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>{t('dice:advanced.advanced-settings.enable-sound')}</FormLabel>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="volume"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>{t('dice:advanced.advanced-settings.volume')}</FormLabel>
                <FormControl>
                  <Slider
                    defaultValue={[field.value]}
                    min={0}
                    max={100}
                    step={1}
                    onValueCommit={([value]) => field.onChange(value)}
                  />
                </FormControl>
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="bcdiceApiEndpoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('dice:advanced.advanced-settings.bcdice-server')}</FormLabel>
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
                  onClick={() => field.onChange(bcdiceApiEndpoint)}
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
