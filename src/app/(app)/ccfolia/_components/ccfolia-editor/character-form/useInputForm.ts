import { valibotResolver } from '@hookform/resolvers/valibot';
import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import {
  ccfoliaEditorCharacterSchema,
  createDefaultCcfoliaEditorCharacter,
  type CcfoliaEditorCharacter,
  stringifyCcfoliaClipboardCharacter,
} from '@/features/ccfolia/model';

export const useInputForm = () => {
  const defaultValues = useMemo(createDefaultCcfoliaEditorCharacter, []);
  const form = useForm<CcfoliaEditorCharacter>({
    resolver: valibotResolver(ccfoliaEditorCharacterSchema),
    defaultValues,
  });
  const watchedValues = useWatch({ control: form.control });
  const formResult = stringifyCcfoliaClipboardCharacter(form.getValues());

  return { form, formResult, characterName: watchedValues.name ?? '' };
};
