import React from 'react';

import { cn } from '~/utils/cn';

export const ChatHeading = ({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      className={cn('flex gap-2 items-center text-foreground', className)}
      {...rest}
    >
      {children}
    </h3>
  );
};
