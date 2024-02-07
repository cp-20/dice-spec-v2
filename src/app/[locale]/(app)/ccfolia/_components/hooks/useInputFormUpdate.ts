import { useCallback } from 'react';
import { useFormResult } from './useFormResult';
import type { InputFormSchemaType } from './useInputForm';

export const useInputFormUpdate = () => {
  const { setFormResult } = useFormResult();
  const watchInput = useCallback(
    (data: InputFormSchemaType) => {
      const result = convert(data);
      setFormResult(result);
    },
    [setFormResult],
  );

  return { watchInput };
};

const convert = (data: InputFormSchemaType): string => {
  const { status: rawStatus, params: rawParams } = data;
  const status = rawStatus.map(({ label, value, max }) => ({
    label,
    value,
    max,
  }));
  const params = rawParams.map(({ label, value }) => ({ label, value }));

  const payload = {
    ...data,
    status,
    params,
  };

  const result = JSON.stringify(payload);

  return result;
};
