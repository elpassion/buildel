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
          'text-xs rounded-lg text-neutral-100 py-1 px-3 hover:bg-neutral-900',
          { 'bg-neutral-900': isActive },
          className,
        )
      }
      {...rest}
    >
      {children}
    </NavLink>
  );
};
