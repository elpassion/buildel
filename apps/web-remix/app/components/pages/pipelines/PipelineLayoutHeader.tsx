import React from 'react';

import { cn } from '~/utils/cn';

export const PipelineLayoutHeader = ({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <header
      className={cn(
        'w-full bg-white border-b border-input px-4 py-2 flex flex-col gap-2 justify-between md:flex-row md:items-center md:h-16',
        className,
      )}
      {...rest}
    >
      {children}
    </header>
  );
};
