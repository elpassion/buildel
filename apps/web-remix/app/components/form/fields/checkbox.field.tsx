import React from 'react';
import type * as CheckboxPrimitive from '@radix-ui/react-checkbox';

import { useFieldContext } from '~/components/form/fields/field.context';
import { useControlField } from '~/components/form/fields/form.field';
import type { CheckboxInputProps } from '~/components/form/inputs/checkbox.input';
import { CheckboxInput } from '~/components/form/inputs/checkbox.input';

export const CheckboxInputField = ({
  ref,
  ...props
}: CheckboxInputProps & {
  ref?: React.RefObject<React.ElementRef<typeof CheckboxPrimitive.Root>>;
}) => {
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
};
CheckboxInputField.displayName = 'CheckboxInputField';
