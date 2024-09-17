import React from 'react';

import type { TextareaInputProps } from '~/components/form/inputs/textarea.input';
import { TextareaInput } from '~/components/form/inputs/textarea.input';
import { cn } from '~/utils/cn';

export function NodeReadonlyItemWrapper({
  className,
  children,
  show,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { show?: boolean }) {
  if (!show) return;
  return (
    <div className={cn('flex flex-col w-full', className)} {...rest}>
      {children}
    </div>
  );
}

export function NodeReadonlyItemTitle({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('text-xs text-muted-foreground', className)} {...rest}>
      {children}
    </span>
  );
}

export function NodeReadonlyItemValue({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-sm text-foreground line-clamp-1 break-all',
        className,
      )}
      {...rest}
    >
      {children}
    </p>
  );
}

export function NodeReadonlyBooleanValue({
  className,
  value,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement> & { value: boolean }) {
  return (
    <NodeReadonlyItemValue
      className={cn({ 'text-green-500': value }, className)}
      {...rest}
    >
      {value ? 'Yes' : 'No'}
    </NodeReadonlyItemValue>
  );
}

export function NodeReadonlyItemTextarea({
  className,
  ...rest
}: TextareaInputProps) {
  return (
    <TextareaInput
      disabled
      className={cn('disabled:opacity-100 disabled:cursor-default', className)}
      {...rest}
    />
  );
}
