import React from 'react';
import { useLoaderData } from '@remix-run/react';
import { InputText, Label } from '@elpassion/taco';
import { useControlField, useFormContext } from 'remix-validated-form';

import { useFieldContext } from '~/components/form/fields/field.context';
import type { NumberInputProps } from '~/components/form/inputs/number.input';
import { NumberInput } from '~/components/form/inputs/number.input';
import { ToggleInput } from '~/components/form/inputs/toggle.input';
import type { loader } from '~/components/pages/pipelines/settings/loader.server';

export const BudgetLimitField: React.FC<Partial<NumberInputProps>> = ({
  supportingText,
  label,
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
    setValue(e.target.valueAsNumber);
  };
  return (
    <div>
      <div
        className="flex gap-2 justify-between items-center mb-2"
        onClick={(e) => e.preventDefault()}
      >
        <div className="flex gap-2">
          <Label text={label} className="!m-0" />
          <ToggleInput
            autoComplete={name}
            checked={value !== null}
            onChange={onCheck}
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
        {...rest}
        disabled={value === null}
      />

      <InputText
        text={fieldErrors[name] || supportingText}
        error={!!fieldErrors[name]}
      />
    </div>
  );
};
