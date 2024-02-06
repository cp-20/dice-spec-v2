import { useMemo } from 'react';
import { useDiceRollValidation } from './useDiceRollOption';

export const useDiceInputValidation = (input: string) => {
  const { validate } = useDiceRollValidation();
  const isValid = useMemo(() => validate(input), [input, validate]);

  return { isValid };
};
