import React, { forwardRef } from 'react';

import { useFieldContext } from '~/components/form/fields/field.context';
import type { LabelProps } from '~/components/ui/label';
import { Label } from '~/components/ui/label';
import { cn } from '~/utils/cn';

export const FieldLabel = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, className, ...props }, ref) => {
    const { name } = useFieldContext();
    return (
      <Label
        ref={ref}
        htmlFor={name}
        className={cn('block mb-2', className)}
        {...props}
      >
        {children}
      </Label>
    );
  },
);
FieldLabel.displayName = 'FieldLabel';
