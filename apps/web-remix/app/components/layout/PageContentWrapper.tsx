import type { PropsWithChildren } from 'react';
import React from 'react';

import { cn } from '~/utils/cn';

export interface PageContentWrapperProps extends PropsWithChildren {
  className?: string;
}

export const PageContentWrapper: React.FC<PageContentWrapperProps> = ({
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        'max-w-[1344px] px-4 mx-auto w-full md:px-6 lg:px-10',
        className,
      )}
    >
      {children}
    </div>
  );
};
