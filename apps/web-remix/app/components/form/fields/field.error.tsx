import type { HTMLAttributes } from 'react';
import React, { forwardRef } from 'react';

import { useFieldContext } from '~/components/form/fields/field.context';

export const FieldError = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, ...props }) => {
  const { name, error } = useFieldContext();
  return (
    <div
      className="min-h-[2rem] pt-1 text-red-700"
      id={`${name}-error`}
      {...props}
    >
      {children || error}
    </div>
  );
});
FieldError.displayName = 'FieldError';
