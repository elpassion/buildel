import React from 'react';

import { cn } from '~/utils/cn';

export function NodeReadonlyItemWrapper({
  className,
  children,
  show,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { show?: boolean }) {
  if (!show) return;
  return (
    <div className={cn('flex flex-col', className)} {...rest}>
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
