import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { FC } from 'react';
import { variableFieldChangeHandlerGenerator } from './composable/variableFieldChangeHandler';
import type { InputFormSchemaType } from './hooks/useInputForm';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

type Parameter = InputFormSchemaType['params'][number];

export type ParameterInputProps = {
  value: Parameter[];
  onChange: (value: Parameter[]) => void;
};

export const ParameterInput: FC<ParameterInputProps> = ({
  value,
  onChange,
}) => {
  const handleParameterChange = variableFieldChangeHandlerGenerator<Parameter>(
    value,
    onChange,
  );

  return (
    <div className="mt-4">
      <div className="space-y-2 @container">
        {value.map((status) => (
          <div key={status.key} className="flex items-center gap-2">
            <Input
              value={status.label}
              placeholder="ラベル"
              className="h-8 flex-1 @xs:h-10"
              onChange={handleParameterChange(status, 'label')}
            />
            <Input
              value={status.value}
              placeholder="値"
              className="h-8 w-1/4 @xs:h-10"
              onChange={handleParameterChange(status, 'value')}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 @xs:h-10 @xs:w-10"
              onClick={() => {
                onChange(value.filter((s) => s.key !== status.key));
              }}
            >
              <IconTrash className="@xs:h-6 @xs:w-6" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        className="mt-4 w-full"
        onClick={() => {
          onChange([
            ...value,
            {
              key: Date.now().toString() + Math.random().toString(36).slice(2),
              label: '',
              value: '0',
            },
          ]);
        }}
      >
        <IconPlus />
        <span>新しいパラメータを追加</span>
      </Button>
    </div>
  );
};
