import { IconPlus, IconTrash } from '@tabler/icons-react';
import { t } from 'i18next';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';

import {
  type CcfoliaEditorCharacter,
  MAX_CCFOLIA_CHARACTER_LABEL_LENGTH,
  MAX_CCFOLIA_CHARACTER_STATUSES,
} from '@/features/ccfolia/model';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/shadcn-utils';

import { type CompositeFieldFocusHandle, useCompositeFieldFocus } from './useCompositeFieldFocus';
import { numberFormatter, variableFieldChangeHandlerGenerator } from './variableFieldChangeHandler';
type Status = CcfoliaEditorCharacter['status'][number];

type StatusInputProps = Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> & {
  value: Status[];
  onChange: (value: Status[]) => void;
};

export const StatusInput = forwardRef<CompositeFieldFocusHandle, StatusInputProps>(
  ({ value, onChange, className, ...rootProps }, ref) => {
    const handleStatusChange = variableFieldChangeHandlerGenerator<Status>(value, onChange);
    const { primaryRef, fallbackRef } = useCompositeFieldFocus<HTMLInputElement, HTMLButtonElement>(ref);

    return (
      <div {...rootProps} className={cn('mt-4', className)}>
        <div className="space-y-2 @container">
          {value.map((status, index) => (
            <div key={status.key} className="flex items-center gap-2">
              <Input
                ref={index === 0 ? primaryRef : undefined}
                maxLength={MAX_CCFOLIA_CHARACTER_LABEL_LENGTH}
                value={status.label}
                placeholder={t('ccfolia:input.status.status-label')}
                className="h-8 flex-1 @xs:h-10"
                onChange={handleStatusChange(status, 'label')}
                aria-label={t('ccfolia:input.status.status-label')}
              />
              <Input
                type="number"
                value={status.value ?? ''}
                placeholder={t('ccfolia:input.status.status-value')}
                className="h-8 w-1/5 @xs:h-10"
                onChange={handleStatusChange(status, 'value', numberFormatter)}
                aria-label={t('ccfolia:input.status.status-value')}
              />
              <Input
                type="number"
                value={status.max ?? ''}
                placeholder={t('ccfolia:input.status.status-max')}
                className="h-8 w-1/5 @xs:h-10"
                onChange={handleStatusChange(status, 'max', numberFormatter)}
                aria-label={t('ccfolia:input.status.status-max')}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 @xs:h-10 @xs:w-10"
                aria-label={t('ccfolia:input.status.delete', { label: status.label })}
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
          ref={fallbackRef}
          type="button"
          variant="secondary"
          className="mt-4 w-full"
          disabled={value.length >= MAX_CCFOLIA_CHARACTER_STATUSES}
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
  },
);
