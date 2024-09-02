import type { ReactElement, ReactNode } from 'react';
import React, {
  cloneElement,
  forwardRef,
  isValidElement,
  useMemo,
} from 'react';

import type { BasicLinkProps } from '~/components/link/BasicLink';
import { BasicLink } from '~/components/link/BasicLink';
import type { EmptyMessageProps } from '~/components/list/ItemList';
import { EmptyMessage } from '~/components/list/ItemList';
import type { BadgeProps } from '~/components/ui/badge';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { cn } from '~/utils/cn';

export const Table = ({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableElement>) => {
  return (
    <div className={cn('border border-input rounded-lg', className)}>
      <table className={cn('w-full')} {...rest}>
        {children}
      </table>
    </div>
  );
};

export const TableHead = ({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableSectionElement>) => {
  return (
    <thead
      className={cn('text-left text-muted-foreground text-xs', className)}
      {...rest}
    >
      {children}
    </thead>
  );
};

export const TableHeadRow = ({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement>) => {
  return (
    <tr
      className={cn(
        'rounded-xl overflow-hidden border-b border-input',
        className,
      )}
      {...rest}
    >
      {children}
    </tr>
  );
};

export const TableHeadCell = ({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableHeaderCellElement>) => {
  return (
    <th
      className={cn(
        'py-3 px-5 first:rounded-tl-lg first:rounded-bl-lg last:rounded-tr-lg last:rounded-br-lg font-normal',
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  );
};

export const TableBody = ({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableSectionElement>) => {
  return (
    <tbody className={cn(className)} {...rest}>
      {children}
    </tbody>
  );
};

export const TableBodyRow = ({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement>) => {
  return (
    <tr
      className={cn('[&:not(:first-child)]:border-t border-input', className)}
      {...rest}
    >
      {children}
    </tr>
  );
};

export const TableBodyCell = ({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableCellElement>) => {
  return (
    <td
      className={cn('py-3 px-5 text-foreground text-sm', className)}
      {...rest}
    >
      {children}
    </td>
  );
};

type ExternalLinkCellProps = Omit<BasicLinkProps, 'children'> & {
  icon: ReactNode;
};

export const ExternalLinkCell = forwardRef<
  HTMLButtonElement,
  ExternalLinkCellProps
>(({ className, icon, ...rest }, ref) => {
  const modifiedIcon = isValidElement(icon)
    ? cloneElement(icon, {
        // @ts-ignore
        className: cn('w-3.5 h-3.5', (icon as ReactElement).props.className),
      })
    : icon;

  return (
    <Button asChild variant="ghost" className="w-7 h-7 p-0" ref={ref}>
      <BasicLink className={cn(className)} target="_blank" {...rest}>
        {modifiedIcon}
      </BasicLink>
    </Button>
  );
});

ExternalLinkCell.displayName = 'ExternalLinkCell';

export const CellStatusBadge = ({
  status,
  children,
  ...rest
}: Omit<BadgeProps, 'variant'> & {
  status: 'finished' | 'running' | 'created';
}) => {
  const variant = useMemo(() => {
    if (status === 'finished') return 'secondary';
    if (status === 'created') return 'outline';
    return 'default';
  }, [status]);

  return (
    <Badge variant={variant} {...rest}>
      {children}
      {status === 'running' && <span className="animate-dotsLoading">...</span>}
    </Badge>
  );
};

export const CellText = ({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('line-clamp-3', className)} {...rest}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent side="top" className={cn('max-w-[400px]')}>
            {children}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
};

export const CellHeader = ({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn('whitespace-nowrap truncate w-full', className)}
            {...rest}
          >
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className={cn('max-w-[400px]')}>
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const CellNumberBadge = ({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'bg-muted rounded px-1.5 py-0.5 text-foreground w-fit text-xs',
        className,
      )}
    >
      {children}
    </div>
  );
};

export const TableEmptyMessage = ({
  className,
  children,
  ...rest
}: EmptyMessageProps) => {
  return (
    <EmptyMessage className={cn('px-5 whitespace-nowrap', className)} {...rest}>
      {children}
    </EmptyMessage>
  );
};
