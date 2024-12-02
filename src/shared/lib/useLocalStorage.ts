import type { PrimitiveAtom } from "jotai";
import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import type { BaseIssue, BaseSchema } from "valibot";
import * as v from "valibot";

type Schema<T> = BaseSchema<unknown, T, BaseIssue<unknown>>;

const getLocalStorageValue = <T>(
  key: string,
  initValue: T,
  schema: Schema<T>,
) => {
  const item = localStorage.getItem(key);
  if (item === null) return initValue;

  try {
    const json = JSON.parse(item);
    const value = v.parse(schema, json);
    return value;
  } catch (err) {
    console.error(err);
    return initValue;
  }
};

export const useLocalStorage = <T>(
  key: string,
  initValue: T,
  schema: Schema<T>,
) => {
  const [value, setValue] = useState(() =>
    getLocalStorageValue(key, initValue, schema)
  );

  const setLocalStorageValue = useCallback(
    (setStateAction: T | ((prevState: T) => T)) => {
      const newValue = setStateAction instanceof Function
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
  schema: Schema<T>,
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
      const newValue = setStateAction instanceof Function
        ? setStateAction(value)
        : setStateAction;

      localStorage.setItem(key, JSON.stringify(newValue));
      setValue(newValue);
    },
    [key, setValue, value],
  );

  return [value, setLocalStorageValue] as const;
};
