import { cn } from '~/utils/cn';

export const Table = ({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLTableElement>) => {
  return (
    <div className="border border-input rounded-lg">
      <table className={cn('w-full', className)} {...rest}>
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
