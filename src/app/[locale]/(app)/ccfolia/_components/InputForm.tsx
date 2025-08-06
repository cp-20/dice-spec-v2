'use client';

import { t } from 'i18next';
import type { FC } from 'react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { ColorInput } from './ColorInput';
import { useInputForm } from './hooks/useInputForm';
import { ParameterInput } from './ParameterInput';
import { StatusInput } from './StatusInput';

export const InputForm: FC = () => {
  const { form, handleSubmit } = useInputForm();

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('ccfolia:input.name.label')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('ccfolia:input.name.placeholder')}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="memo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('ccfolia:input.memo.label')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('ccfolia:input.memo.placeholder')}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="initiative"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('ccfolia:input.initiative.label')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('ccfolia:input.initiative.placeholder')}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>{t('ccfolia:input.initiative.description')}</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="externalUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('ccfolia:input.external-url.label')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('ccfolia:input.external-url.placeholder')}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>{t('ccfolia:input.external-url.description')}</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('ccfolia:input.status.label')}</FormLabel>
                <FormDescription>{t('ccfolia:input.status.description')}</FormDescription>
                <FormControl>
                  <StatusInput value={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="params"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('ccfolia:input.params.label')}</FormLabel>
                <FormDescription>{t('ccfolia:input.params.description')}</FormDescription>
                <FormControl>
                  <ParameterInput value={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('ccfolia:input.color.label')}</FormLabel>
                <FormControl>
                  <ColorInput value={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="commands"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('ccfolia:input.commands.label')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('ccfolia:input.commands.description')}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>{t('ccfolia:input.commands.description')}</FormDescription>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};
