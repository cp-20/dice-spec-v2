import type { PrimitiveAtom } from 'jotai';
import { useAtom } from 'jotai';
import { useState, useCallback, useEffect } from 'react';
import type { BaseSchema } from 'valibot';
import { parse } from 'valibot';

const getLocalStorageValue = <T>(
  key: string,
  initValue: T,
  schema: BaseSchema<T>,
) => {
  const item = localStorage.getItem(key);
  if (item === null) return initValue;

  try {
    const json = JSON.parse(item);
    const value = parse(schema, json);
    return value;
  } catch (err) {
    console.error(err);
    return initValue;
  }
};

export const useLocalStorage = <T>(
  key: string,
  initValue: T,
  schema: BaseSchema<T>,
) => {
  const [value, setValue] = useState(() =>
    getLocalStorageValue(key, initValue, schema),
  );

  const setLocalStorageValue = useCallback(
    (setStateAction: T | ((prevState: T) => T)) => {
      const newValue =
        setStateAction instanceof Function
          ? setStateAction(value)
          : setStateAction;

      localStorage.setItem(key, JSON.stringify(newValue));
      setValue(newValue);
    },
    [key, value],
  );

  return [value, setLocalStorageValue] as const;
};

export const useLocalStorageAtom = <T>(
  key: string,
  atom: PrimitiveAtom<T>,
  schema: BaseSchema<T>,
  rawInitValue?: T,
) => {
  const [value, setValue] = useAtom(atom);

  useEffect(() => {
    const initValue = getLocalStorageValue(key, rawInitValue ?? null, schema);
    if (initValue === null) return;
    setValue(initValue);
  }, [key, rawInitValue, schema, setValue]);

  const setLocalStorageValue = useCallback(
    (setStateAction: T | ((prevState: T) => T)) => {
      const newValue =
        setStateAction instanceof Function
          ? setStateAction(value)
          : setStateAction;

      localStorage.setItem(key, JSON.stringify(newValue));
      setValue(newValue);
    },
    [key, setValue, value],
  );

  return [value, setLocalStorageValue] as const;
};
