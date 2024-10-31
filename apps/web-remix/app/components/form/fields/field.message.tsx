import type { ReactNode } from 'react';
import React from 'react';

import { useFieldContext } from '~/components/form/fields/field.context';
import { BaseSize } from '~/components/ui/ui.types';
import { cn } from '~/utils/cn';

interface FieldMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: ReactNode;
  size?: BaseSize;
}

export const FieldMessage = React.forwardRef<
  HTMLParagraphElement,
  FieldMessageProps
>(({ className, size, error: propsError, children, ...props }, ref) => {
  const { name, error } = useFieldContext();

  const body = propsError ? propsError : error ? error : children;

  const isError = !!error || !!propsError;

  if (!body) {
    return null;
  }

  return (
    <div
      ref={ref}
      id={name}
      className={cn(
        'font-medium mt-1',
        getMessageSize(size),
        { 'text-red-500': isError, 'text-muted-foreground': !isError },
        className,
      )}
      {...props}
    >
      {body}
    </div>
  );
});
FieldMessage.displayName = 'FieldMessage';

export function getMessageSize(size?: BaseSize) {
  switch (size) {
    case 'sm':
      return 'text-xs';
    default:
      return 'text-sm';
  }
}
