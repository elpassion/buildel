import React, { forwardRef } from 'react';
import type * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { useControlField } from 'remix-validated-form';

import { useFieldContext } from '~/components/form/fields/field.context';
import type { CheckboxInputProps } from '~/components/form/inputs/checkbox.input';
import { CheckboxInput } from '~/components/form/inputs/checkbox.input';

export const CheckboxInputField = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxInputProps
>((props, ref) => {
  const { name, getInputProps, validate } = useFieldContext();
  const [formValue, setFormValue] = useControlField<boolean>(name);

  return (
    <CheckboxInput
      ref={ref}
      name={name}
      id={name}
      {...props}
      onBlur={getInputProps({ type: 'checkbox' }).onBlur}
      checked={formValue}
      onCheckedChange={(value) => {
        setFormValue(value as boolean);
        validate();
      }}
    />
  );
});
CheckboxInputField.displayName = 'CheckboxInputField';
