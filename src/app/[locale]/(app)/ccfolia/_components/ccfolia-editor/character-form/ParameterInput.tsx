import { IconPlus, IconTrash } from '@tabler/icons-react';
import { t } from 'i18next';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';

import {
  type CcfoliaEditorCharacter,
  MAX_CCFOLIA_CHARACTER_LABEL_LENGTH,
  MAX_CCFOLIA_CHARACTER_PARAMS,
  MAX_CCFOLIA_CHARACTER_PARAM_VALUE_LENGTH,
} from '@/features/ccfolia/model';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/shadcn-utils';

import { type CompositeFieldFocusHandle, useCompositeFieldFocus } from './useCompositeFieldFocus';
import { variableFieldChangeHandlerGenerator } from './variableFieldChangeHandler';

type Parameter = CcfoliaEditorCharacter['params'][number];

type ParameterInputProps = Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> & {
  value: Parameter[];
  onChange: (value: Parameter[]) => void;
};

export const ParameterInput = forwardRef<CompositeFieldFocusHandle, ParameterInputProps>(
  ({ value, onChange, className, ...rootProps }, ref) => {
    const handleParameterChange = variableFieldChangeHandlerGenerator<Parameter>(value, onChange);
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
                placeholder={t('ccfolia:input.params.param-label')}
                className="h-8 flex-1 @xs:h-10"
                onChange={handleParameterChange(status, 'label')}
                aria-label={t('ccfolia:input.params.param-label')}
              />
              <Input
                maxLength={MAX_CCFOLIA_CHARACTER_PARAM_VALUE_LENGTH}
                value={status.value}
                placeholder={t('ccfolia:input.params.param-value')}
                className="h-8 w-1/4 @xs:h-10"
                onChange={handleParameterChange(status, 'value')}
                aria-label={t('ccfolia:input.params.param-value')}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 @xs:h-10 @xs:w-10"
                aria-label={t('ccfolia:input.params.delete', { label: status.label })}
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
          disabled={value.length >= MAX_CCFOLIA_CHARACTER_PARAMS}
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
          <span>{t('ccfolia:input.params.add')}</span>
        </Button>
      </div>
    );
  },
);
