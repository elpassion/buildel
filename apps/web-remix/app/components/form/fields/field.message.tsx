import type { ReactNode } from 'react';
import React from 'react';

import { useFieldContext } from '~/components/form/fields/field.context';
import type { InputMessageProps } from '~/components/ui/label';
import { InputMessage } from '~/components/ui/label';

interface FieldMessageProps extends Omit<InputMessageProps, 'isError'> {
  error?: ReactNode;
}

export const FieldMessage = ({
  className,
  size,
  error: propsError,
  children,
  ...rest
}: FieldMessageProps) => {
  const { error } = useFieldContext();

  const body = propsError ? propsError : error() ? error() : children;

  const isError = !!error || !!propsError;

  if (!body) {
    return null;
  }

  return (
    <InputMessage className={className} size={size} {...rest} isError={isError}>
      {body}
    </InputMessage>
  );
};
FieldMessage.displayName = 'FieldMessage';
