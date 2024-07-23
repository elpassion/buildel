import type { PropsWithChildren } from 'react';
import React from 'react';
import { NavLink } from '@remix-run/react';
import type { NavLinkProps } from '@remix-run/react';

import { cn } from '~/utils/cn';

export const OutlinedTabsWrapper: React.FC<
  PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  return (
    <ul className={cn('flex gap-2 border-b input w-full', className)}>
      {children}
    </ul>
  );
};

export const OutlinedTabLink = ({ children, ...rest }: NavLinkProps) => {
  return (
    <NavLink
      prefetch="intent"
      className={({ isActive }) =>
        cn('text-sm pb-2 px-3 whitespace-nowrap', {
          'border-b-2 border-primary text-foreground': isActive,
          'text-muted-foreground': !isActive,
        })
      }
      {...rest}
    >
      {children}
    </NavLink>
  );
};
