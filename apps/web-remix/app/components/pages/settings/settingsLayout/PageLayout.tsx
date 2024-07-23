import { cn } from '~/utils/cn';

export function Section({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section className={cn('text-foreground', className)} {...rest}>
      {children}
    </section>
  );
}

export function SectionHeading({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn('text-foreground text-lg', className)} {...rest}>
      {children}
    </h2>
  );
}

export function SectionContent({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border border-input rounded-xl p-4 flex justify-between items-center gap-3 max-w-[400px]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
