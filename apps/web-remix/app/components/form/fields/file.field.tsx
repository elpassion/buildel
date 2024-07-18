import React, { forwardRef } from 'react';

import { useFieldContext } from '~/components/form/fields/field.context';

import { SmallFileInput } from '../inputs/file.input';
import type { SmallFileInputProps } from '../inputs/file.input';

export const SmallFileInputField = forwardRef<
  HTMLInputElement,
  SmallFileInputProps
>(({ ...props }) => {
  const { name, getInputProps, error } = useFieldContext();

  return (
    <SmallFileInput
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={`${name}-error`}
      aria-errormessage={error ? `${name}-error` : undefined}
      aria-label={name}
      autoComplete={name}
      {...getInputProps()}
      {...props}
    />
  );
});
SmallFileInputField.displayName = 'SmallFileInputField';
