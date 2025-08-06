import { IconPlus, IconTrash } from '@tabler/icons-react';
import { t } from 'i18next';
import type { FC } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { numberFormatterGenerator, variableFieldChangeHandlerGenerator } from './composable/variableFieldChangeHandler';
import type { InputFormSchemaType } from './hooks/useInputForm';

type Status = InputFormSchemaType['status'][number];

export type StatusInputProps = {
  value: Status[];
  onChange: (value: Status[]) => void;
};

export const StatusInput: FC<StatusInputProps> = ({ value, onChange }) => {
  const handleStatusChange = variableFieldChangeHandlerGenerator<Status>(value, onChange);

  return (
    <div className="mt-4">
      <div className="space-y-2 @container">
        {value.map((status) => (
          <div key={status.key} className="flex items-center gap-2">
            <Input
              value={status.label}
              placeholder={t('ccfolia:input.status.status-label')}
              className="h-8 flex-1 @xs:h-10"
              onChange={handleStatusChange(status, 'label')}
            />
            <Input
              value={status.value}
              placeholder={t('ccfolia:input.status.status-value')}
              className="h-8 w-1/5 @xs:h-10"
              onChange={handleStatusChange(status, 'value', numberFormatterGenerator<Status>('value'))}
            />
            <Input
              value={status.max}
              placeholder={t('ccfolia:input.status.status-max')}
              className="h-8 w-1/5 @xs:h-10"
              onChange={handleStatusChange(status, 'max', numberFormatterGenerator<Status>('value'))}
            />
            <Button
              variant="outline"
              size="icon"
              className="size-8 @xs:h-10 @xs:w-10"
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
        <span>{t('ccfolia:input.status.add')}</span>
      </Button>
    </div>
  );
};
