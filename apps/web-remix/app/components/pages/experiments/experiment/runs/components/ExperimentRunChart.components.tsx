import { cn } from '~/utils/cn';

export function ExperimentRunChartsGrid({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
