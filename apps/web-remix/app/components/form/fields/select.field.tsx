import type { ReactNode } from 'react';
import React, { forwardRef } from 'react';
import { useControlField, useFormContext } from 'remix-validated-form';

import {
  HiddenField,
  useFieldContext,
} from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { SelectInput } from '~/components/form/inputs/select/select.input';
import type { SelectInputProps } from '~/components/form/inputs/select/select.input-impl.client';

interface SelectFieldProps extends SelectInputProps {
  label?: ReactNode;
  supportingText?: ReactNode;
  errorMessage?: ReactNode;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    { defaultValue: _, options, label, supportingText, errorMessage, ...props },
    _ref,
  ) => {
    const { name, getInputProps } = useFieldContext();
    const [selectedId, setSelectedId] = useControlField<string | string[]>(
      name,
    );

    const { fieldErrors } = useFormContext();

    return (
      <div>
        <HiddenField
          value={
            Array.isArray(selectedId)
              ? JSON.stringify(selectedId)
              : selectedId ?? ''
          }
          {...getInputProps()}
        />
        <FieldLabel>{label}</FieldLabel>
        <SelectInput
          id={name}
          options={options}
          value={selectedId}
          placeholder="Select..."
          onChange={setSelectedId}
          {...props}
        />
        <FieldMessage error={errorMessage || fieldErrors[name]}>
          {supportingText}
        </FieldMessage>
      </div>
    );
  },
);
SelectField.displayName = 'SelectField';
