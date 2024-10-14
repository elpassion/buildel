import { cn } from '~/utils/cn';

export function FloatingBoard({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'hidden fixed z-[50] top-0 bottom-0 left-0 right-0 pointer-events-none lg:block',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
