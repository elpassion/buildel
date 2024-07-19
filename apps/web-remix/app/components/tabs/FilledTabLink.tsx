import React from 'react';
import { NavLink } from '@remix-run/react';
import type { NavLinkProps } from '@remix-run/react';
import classNames from 'classnames';

export const FilledTabLink: React.FC<{ className?: string } & NavLinkProps> = ({
  children,
  className,
  ...rest
}) => {
  return (
    <NavLink
      className={({ isActive }) =>
        classNames(
          'text-sm rounded py-1 px-3 hover:bg-background flex justify-center items-center',
          {
            'bg-background text-foreground': isActive,
            'text-muted-foreground': !isActive,
          },
          className,
        )
      }
      {...rest}
    >
      {children}
    </NavLink>
  );
};
