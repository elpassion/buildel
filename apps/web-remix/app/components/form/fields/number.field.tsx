import React from 'react';

import { useFieldContext } from '~/components/form/fields/field.context';
import type { TextInputFieldProps } from '~/components/form/fields/text.field';
import { NumberInput } from '~/components/form/inputs/number.input';

export const NumberInputField = ({
  ref,
  ...props
}: Omit<TextInputFieldProps, 'type'> & {
  ref?: React.RefObject<HTMLInputElement>;
}) => {
  const { name, getInputProps, error } = useFieldContext();
  return (
    <NumberInput
      name={name}
      ref={ref}
      aria-invalid={error ? true : undefined}
      aria-describedby={`${name}-error`}
      aria-errormessage={error ? `${name}-error` : undefined}
      autoComplete={name}
      {...getInputProps()}
      {...props}
    />
  );
};
NumberInputField.displayName = 'NumberInputField';
