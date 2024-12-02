import type { ChangeEventHandler } from 'react';

type VariableFieldValue = {
  key: string;
};

type VariableFieldChangeHandler<Field extends VariableFieldValue> = <InputType>(
  field: Field,
  key: string,
  formatter?: (rawValue: string, field: Field) => InputType,
) => ChangeEventHandler<HTMLInputElement>;

type VariableFieldChangeHandlerGenerator = <Field extends VariableFieldValue>(
  value: Field[],
  onChange: (field: Field[]) => void,
) => VariableFieldChangeHandler<Field>;

export const variableFieldChangeHandlerGenerator: VariableFieldChangeHandlerGenerator =
  (value, onChange) => (field, key, formatter) => (e) => {
    const newValue = value.map((f) => {
      if (f.key !== field.key) {
        return f;
      }

      if (formatter === undefined) {
        return { ...f, [key]: e.target.value };
      }

      return { ...f, [key]: formatter(e.target.value, f) };
    });

    onChange(newValue);
  };

export const numberFormatterGenerator =
  <Field extends VariableFieldValue>(key: keyof Field) =>
  (rawValue: string, field: Field) => {
    if (rawValue === '') {
      return undefined;
    }

    const value = Number.parseInt(rawValue);

    if (Number.isNaN(value)) {
      return field[key];
    }

    return value;
  };
