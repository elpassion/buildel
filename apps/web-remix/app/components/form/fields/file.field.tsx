import React from 'react';

import type { SmallFileUploadProps } from '~/components/fileUpload/SmallFileUpload';
import { SmallFileUpload } from '~/components/fileUpload/SmallFileUpload';
import { useFieldContext } from '~/components/form/fields/field.context';

import { SmallFileInput } from '../inputs/file.input';
import type { SmallFileInputProps } from '../inputs/file.input';

//@todo remove this component and replace it with the SmallUploadInputField component
export const SmallFileInputField = ({
  ...props
}: SmallFileInputProps & { ref?: React.RefObject<HTMLInputElement> }) => {
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
};
SmallFileInputField.displayName = 'SmallFileInputField';

export const SmallUploadInputField = ({
  ...props
}: SmallFileUploadProps & { ref?: React.RefObject<HTMLInputElement> }) => {
  const { name, getInputProps, error } = useFieldContext({
    validationBehavior: {
      initial: 'onChange',
      whenTouched: 'onChange',
      whenSubmitted: 'onChange',
    },
  });

  return (
    <SmallFileUpload
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={`${name}-error`}
      aria-errormessage={error ? `${name}-error` : undefined}
      aria-label={name}
      {...getInputProps()}
      {...props}
    />
  );
};
SmallUploadInputField.displayName = 'SmallUploadInputField';
