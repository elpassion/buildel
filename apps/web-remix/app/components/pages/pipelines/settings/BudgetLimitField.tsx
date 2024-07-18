import type { ReactNode } from 'react';
import React from 'react';
import { useLoaderData } from '@remix-run/react';
import { useControlField, useFormContext } from 'remix-validated-form';

import { useFieldContext } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import type { NumberInputProps } from '~/components/form/inputs/number.input';
import { NumberInput } from '~/components/form/inputs/number.input';
import { ToggleInput } from '~/components/form/inputs/toggle.input';
import type { loader } from '~/components/pages/pipelines/settings/loader.server';

interface BudgetLimitFieldProps extends Partial<NumberInputProps> {
  supportingText: ReactNode;
  label: ReactNode;
}

export const BudgetLimitField: React.FC<BudgetLimitFieldProps> = ({
  label,
  supportingText,
  onChange: propOnChange,
  ...rest
}) => {
  const { details } = useLoaderData<typeof loader>();

  const { name } = useFieldContext();
  const { fieldErrors } = useFormContext();
  const [value, setValue] = useControlField<number | null>(name);

  const onCheck = (bool: boolean) => {
    if (bool) {
      setValue(0);
    } else {
      setValue(null);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.valueAsNumber);
    propOnChange?.(e);
    setValue(e.target.valueAsNumber);
  };
  return (
    <div>
      <div
        className="flex gap-2 justify-between items-center mb-2"
        onClick={(e) => e.preventDefault()}
      >
        <div className="flex gap-2">
          <FieldLabel className="!m-0">{label}</FieldLabel>
          <ToggleInput
            checked={value !== null}
            onCheckedChange={onCheck}
            value=""
          />
        </div>

        <p className="text-xs text-neutral-100">
          Currently ($): {details.total_cost}
        </p>
      </div>

      <NumberInput
        id={name}
        name={name}
        value={value ?? 0}
        onChange={onChange}
        min={0}
        className="text-black"
        {...rest}
        disabled={value === null}
      />

      <FieldMessage error={fieldErrors[name]}>{supportingText}</FieldMessage>
    </div>
  );
};
