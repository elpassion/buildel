import React from 'react';

import { useFieldContext } from '~/components/form/fields/field.context';
import type { LabelProps } from '~/components/ui/label';
import { Label } from '~/components/ui/label';
import { cn } from '~/utils/cn';

export const FieldLabel = ({
  ref,
  children,
  className,
  ...props
}: LabelProps & {
  ref?: React.RefObject<HTMLLabelElement | null>;
}) => {
  const { name } = useFieldContext();

  return (
    <Label
      ref={ref}
      htmlFor={name()}
      className={cn('block mb-2', className)}
      {...props}
    >
      {children}
    </Label>
  );
};
FieldLabel.displayName = 'FieldLabel';
