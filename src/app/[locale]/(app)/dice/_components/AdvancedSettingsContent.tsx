'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { t } from 'i18next';
import { type FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Trans } from 'react-i18next';

import { Form, FormControl, FormField, FormItem, FormLabel } from '@/shared/components/ui/form';
import { Slider } from '@/shared/components/ui/slider';
import { Switch } from '@/shared/components/ui/switch';
import { isOldApp } from '@/shared/lib/const';

import { AdvancedSettingsFormSchema, type AdvancedSettings } from './advancedSettingsSchema';
import { useAdvancedSettings } from './hooks/useAdvancedSettings';

export const AdvancedSettingsContent: FC = () => {
  const { advancedSettings, setAdvancedSettings } = useAdvancedSettings();
  const form = useForm<AdvancedSettings>({
    resolver: valibotResolver(AdvancedSettingsFormSchema),
    values: advancedSettings,
  });

  const watch = form.watch(['showHelp', 'playSound', 'volume']);
  useEffect(() => {
    const [showHelp, playSound, volume] = watch;
    if (
      showHelp !== advancedSettings.showHelp ||
      playSound !== advancedSettings.playSound ||
      volume !== advancedSettings.volume
    ) {
      setAdvancedSettings({ showHelp, playSound, volume });
    }
  }, [advancedSettings.playSound, advancedSettings.showHelp, advancedSettings.volume, setAdvancedSettings, watch]);

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
      </form>
      {!isOldApp && (
        <p className="mt-2 px-4 text-xs text-slate-500 dark:text-slate-400">
          <Trans
            i18nKey="dice:advanced.advanced-settings.migration-announcement"
            components={{
              l: (
                <a
                  href="https://dicespec.vercel.app/dice?keep-old=true"
                  aria-label="Dice Spec v1"
                  className="underline hover:opacity-70"
                />
              ),
            }}
          />
        </p>
      )}
    </Form>
  );
};
