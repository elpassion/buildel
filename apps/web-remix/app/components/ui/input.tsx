import * as React from 'react';

import type { BaseSize } from '~/components/ui/ui.types';
import { cn } from '~/utils/cn';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: BaseSize;
  ref?:
    | React.RefObject<HTMLInputElement | null>
    | ((instance: HTMLInputElement | null) => void)
    | null;
}

const Input = ({ ref, className, type, size, ...props }: InputProps) => {
  return (
    <input
      type={type}
      className={cn(
        'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        getInputSize(size),
        className,
      )}
      ref={ref}
      {...props}
    />
  );
};
Input.displayName = 'Input';

export { Input };

export function getInputSize(size?: BaseSize) {
  switch (size) {
    case 'sm':
      return 'h-9';
    default:
      return 'h-10';
  }
}
