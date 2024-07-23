import type { PropsWithChildren } from 'react';
import React from 'react';

import { cn } from '~/utils/cn';

export type TabsSize = 'xs' | 'sm' | 'lg';

export const FilledTabsWrapper: React.FC<
  PropsWithChildren<{ size?: TabsSize }>
> = ({ children, size }) => {
  return (
    <div
      className={cn(
        'bg-muted flex gap-1 rounded w-fit p-1',
        getTabWrapperSize(size),
      )}
    >
      {children}
    </div>
  );
};

export function getTabWrapperSize(size?: TabsSize) {
  switch (size) {
    case 'xs':
      return 'min-h-8 h-8';
    case 'sm':
      return 'min-h-9 h-9';
    case 'lg':
      return 'min-h-11 h-11';
    default:
      return 'min-h-10 h-10';
  }
}
