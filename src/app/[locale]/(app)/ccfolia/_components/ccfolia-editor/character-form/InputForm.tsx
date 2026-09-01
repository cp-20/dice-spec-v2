'use client';

import { t } from 'i18next';
import type { FC } from 'react';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';

import {
  type CcfoliaEditorCharacter,
  MAX_CCFOLIA_CHARACTER_COMMANDS_LENGTH,
  MAX_CCFOLIA_CHARACTER_EXTERNAL_URL_LENGTH,
  MAX_CCFOLIA_CHARACTER_MEMO_LENGTH,
  MAX_CCFOLIA_CHARACTER_NAME_LENGTH,
} from '@/features/ccfolia/model';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';

import { ColorInput } from './ColorInput';
import { ParameterInput } from './ParameterInput';
import { StatusInput } from './StatusInput';
import { numberFormatter } from './variableFieldChangeHandler';

type InputFormProps = {
  form: UseFormReturn<CcfoliaEditorCharacter>;
  onSubmit: (value: CcfoliaEditorCharacter) => void | Promise<void>;
  onInvalid: (errors: FieldErrors<CcfoliaEditorCharacter>) => void;
  formId: string;
};

export const InputForm: FC<InputFormProps> = ({ form, onSubmit, onInvalid, formId }) => {
  return (
    <Form {...form}>
      <form id={formId} aria-label={t('ccfolia:editor-form')} onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <div className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">{t('ccfolia:input.name.label')}</FormLabel>
                <FormControl>
                  <Input
                    ref={field.ref}
                    maxLength={MAX_CCFOLIA_CHARACTER_NAME_LENGTH}
                    placeholder={t('ccfolia:input.name.placeholder')}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage>{t('ccfolia:input.validation-error')}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="memo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">{t('ccfolia:input.memo.label')}</FormLabel>
                <FormControl>
                  <Textarea
                    ref={field.ref}
                    maxLength={MAX_CCFOLIA_CHARACTER_MEMO_LENGTH}
                    placeholder={t('ccfolia:input.memo.placeholder')}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage>{t('ccfolia:input.validation-error')}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="initiative"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">{t('ccfolia:input.initiative.label')}</FormLabel>
                <FormControl>
                  <Input
                    ref={field.ref}
                    type="number"
                    placeholder={t('ccfolia:input.initiative.placeholder')}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(numberFormatter(value));
                    }}
                  />
                </FormControl>
                <FormDescription>{t('ccfolia:input.initiative.description')}</FormDescription>
                <FormMessage>{t('ccfolia:input.validation-error')}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="externalUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">{t('ccfolia:input.external-url.label')}</FormLabel>
                <FormControl>
                  <Input
                    ref={field.ref}
                    maxLength={MAX_CCFOLIA_CHARACTER_EXTERNAL_URL_LENGTH}
                    placeholder={t('ccfolia:input.external-url.placeholder')}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>{t('ccfolia:input.external-url.description')}</FormDescription>
                <FormMessage>{t('ccfolia:input.validation-error')}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">{t('ccfolia:input.status.label')}</FormLabel>
                <FormDescription>{t('ccfolia:input.status.description')}</FormDescription>
                <FormControl>
                  <StatusInput ref={field.ref} value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage>{t('ccfolia:input.validation-error')}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="params"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">{t('ccfolia:input.params.label')}</FormLabel>
                <FormDescription>{t('ccfolia:input.params.description')}</FormDescription>
                <FormControl>
                  <ParameterInput ref={field.ref} value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage>{t('ccfolia:input.validation-error')}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">{t('ccfolia:input.color.label')}</FormLabel>
                <FormControl>
                  <ColorInput ref={field.ref} value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage>{t('ccfolia:input.color.format-error')}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="commands"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2 block">{t('ccfolia:input.commands.label')}</FormLabel>
                <FormControl>
                  <Textarea
                    ref={field.ref}
                    maxLength={MAX_CCFOLIA_CHARACTER_COMMANDS_LENGTH}
                    placeholder={t('ccfolia:input.commands.placeholder')}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>{t('ccfolia:input.commands.description')}</FormDescription>
                <FormMessage>{t('ccfolia:input.validation-error')}</FormMessage>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};
