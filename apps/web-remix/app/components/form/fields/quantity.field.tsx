import React from 'react';

import { useFieldContext } from '~/components/form/fields/field.context';
import type { QuantityInputProps } from '~/components/form/inputs/quantity.input';
import { QuantityInput } from '~/components/form/inputs/quantity.input';

export const QuantityInputField = ({
  ref,
  ...props
}: Partial<QuantityInputProps> & {
  ref?: React.RefObject<HTMLInputElement>;
}) => {
  const { name, getInputProps, error } = useFieldContext();
  return (
    <QuantityInput
      name={name()}
      ref={ref}
      aria-invalid={error() ? true : undefined}
      aria-describedby={`${name()}-error`}
      aria-errormessage={error() ? `${name()}-error` : undefined}
      autoComplete={name()}
      {...props}
      {...getInputProps()}
    />
  );
};
QuantityInputField.displayName = 'QuantityInputField';
