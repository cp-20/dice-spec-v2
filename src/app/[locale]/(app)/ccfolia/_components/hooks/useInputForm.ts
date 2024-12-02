import { valibotResolver } from '@hookform/resolvers/valibot';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { InferInput } from 'valibot';
import * as v from 'valibot';
import { useInputFormUpdate } from './useInputFormUpdate';

export const InputFormSchema = v.object({
  name: v.string(),
  memo: v.string(),
  initiative: v.optional(v.number()),
  externalUrl: v.optional(v.string()),
  status: v.array(
    v.object({
      key: v.string(),
      label: v.string(),
      value: v.optional(v.number()),
      max: v.optional(v.number()),
    }),
  ),
  params: v.array(
    v.object({
      key: v.string(),
      label: v.string(),
      value: v.string(),
    }),
  ),
  color: v.pipe(v.string(), v.regex(/^#[0-9a-f]{6}$/i)),
  commands: v.string(),
});

export type InputFormSchemaType = InferInput<typeof InputFormSchema>;

export const useInputForm = () => {
  const form = useForm<InputFormSchemaType>({
    resolver: valibotResolver(InputFormSchema),
    defaultValues: {
      name: '',
      memo: '',
      externalUrl: '',
      status: [
        {
          key: '0',
          label: 'HP',
          value: 0,
          max: 0,
        },
        {
          key: '1',
          label: 'MP',
          value: 0,
          max: 0,
        },
        {
          key: '2',
          label: 'SAN',
          value: 0,
          max: 0,
        },
      ],
      params: [],
      color: '#888888',
      commands: '',
    },
  });

  const { watchInput } = useInputFormUpdate();
  useEffect(() => {
    form.watch(() => watchInput(form.getValues()));
    watchInput(form.getValues());
  }, [form, watchInput]);

  const handleSubmit = form.handleSubmit(() => {});

  return {
    form,
    handleSubmit,
  };
};
