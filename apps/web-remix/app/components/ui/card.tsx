import * as React from 'react';

import { cn } from '~/utils/cn';

const Card = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.RefObject<HTMLDivElement>;
}) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm hover:border-blue-200 transition group',
      className,
    )}
    {...props}
  />
);
Card.displayName = 'Card';

const CardHeader = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.RefObject<HTMLDivElement>;
}) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 py-3 px-4', className)}
    {...props}
  />
);
CardHeader.displayName = 'CardHeader';

const CardTitle = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  ref?: React.RefObject<HTMLParagraphElement>;
}) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight group-hover:text-blue-500 transition',
      className,
    )}
    {...props}
  />
);
CardTitle.displayName = 'CardTitle';

const CardDescription = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  ref?: React.RefObject<HTMLParagraphElement>;
}) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
);
CardDescription.displayName = 'CardDescription';

const CardContent = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.RefObject<HTMLDivElement>;
}) => <div ref={ref} className={cn('pb-3 px-4 pt-0', className)} {...props} />;
CardContent.displayName = 'CardContent';

const CardFooter = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.RefObject<HTMLDivElement>;
}) => (
  <div
    ref={ref}
    className={cn('flex items-center pb-3 px-4 pt-0', className)}
    {...props}
  />
);
CardFooter.displayName = 'CardFooter';

function CardContentColumnWrapper({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex gap-5 shrink-0 w-full justify-between items-center py-2 xl:gap-1 xl:flex-col xl:items-start xl:py-0 xl:justify-start',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

function CardContentColumnTitle({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-xs text-neutral-300 shrink-0 whitespace-nowrap',
        className,
      )}
      {...rest}
    >
      {children}
    </p>
  );
}

function CardContentColumnValue({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-foreground', className)} {...rest}>
      {children}
    </p>
  );
}

function CardContentBooleanValue({
  children,
  className,
  value,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement> & { value: boolean }) {
  return (
    <CardContentColumnValue
      className={cn(
        'flex gap-1 items-center',
        { 'text-neutral-400': !value },
        className,
      )}
      {...rest}
    >
      {children}
    </CardContentColumnValue>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardContentColumnTitle,
  CardContentBooleanValue,
  CardContentColumnValue,
  CardContentColumnWrapper,
};
