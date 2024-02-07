import { valibotResolver } from '@hookform/resolvers/valibot';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Input } from 'valibot';
import { object, string, optional, number, array, regex } from 'valibot';
import { useInputFormUpdate } from './useInputFormUpdate';

export const InputFormSchema = object({
  name: string(),
  memo: string(),
  initiative: optional(number()),
  externalUrl: optional(string()),
  status: array(
    object({
      key: string(),
      label: string(),
      value: optional(number()),
      max: optional(number()),
    }),
  ),
  params: array(
    object({
      key: string(),
      label: string(),
      value: string(),
    }),
  ),
  color: string([regex(/^#[0-9a-f]{6}$/i)]),
  commands: string(),
});

export type InputFormSchemaType = Input<typeof InputFormSchema>;

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
