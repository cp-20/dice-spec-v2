import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { FC } from 'react';
import type { FormSchemaType } from '@/app/(app)/ccfolia/_components/InputForm';
import {
  numberFormatterGenerator,
  variableFieldChangeHandlerGenerator,
} from '@/app/(app)/ccfolia/_components/composable/variableFieldChangeHandler';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

type Status = FormSchemaType['status'][number];

export type StatusInputProps = {
  value: Status[];
  onChange: (value: Status[]) => void;
};

export const StatusInput: FC<StatusInputProps> = ({ value, onChange }) => {
  const handleStatusChange = variableFieldChangeHandlerGenerator<Status>(
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
              onChange={handleStatusChange(status, 'label')}
            />
            <Input
              value={status.value}
              placeholder="現在値"
              className="h-8 w-1/5 @xs:h-10"
              onChange={handleStatusChange(
                status,
                'value',
                numberFormatterGenerator<Status>('value'),
              )}
            />
            <Input
              value={status.max}
              placeholder="最大値"
              className="h-8 w-1/5 @xs:h-10"
              onChange={handleStatusChange(
                status,
                'max',
                numberFormatterGenerator<Status>('value'),
              )}
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
              value: 0,
              max: 0,
            },
          ]);
        }}
      >
        <IconPlus />
        <span>新しいステータスを追加</span>
      </Button>
    </div>
  );
};
