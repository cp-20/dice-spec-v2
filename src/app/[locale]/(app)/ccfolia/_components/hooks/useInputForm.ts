import { valibotResolver } from '@hookform/resolvers/valibot';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { InputFormSchema, type InputFormSchemaType } from './inputFormSchema';
import { useInputFormUpdate } from './useInputFormUpdate';

export { InputFormSchema, type InputFormSchemaType } from './inputFormSchema';

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
