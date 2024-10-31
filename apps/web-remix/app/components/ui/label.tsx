import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';

import type { BaseSize } from '~/components/ui/ui.types';
import { cn } from '~/utils/cn';

const labelVariants = cva(
  'font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

export type LabelProps = React.ComponentPropsWithoutRef<
  typeof LabelPrimitive.Root
> &
  VariantProps<typeof labelVariants> & {
    size?: BaseSize;
  };

const Label = ({
  ref,
  className,
  size,
  ...props
}: LabelProps & {
  ref?: React.RefObject<React.ElementRef<typeof LabelPrimitive.Root> | null>;
}) => {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants(), getLabelSize(size), className)}
      {...props}
    />
  );
};
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

export function getLabelSize(size?: BaseSize) {
  switch (size) {
    case 'sm':
      return 'text-xs';
    default:
      return 'text-sm';
  }
}
