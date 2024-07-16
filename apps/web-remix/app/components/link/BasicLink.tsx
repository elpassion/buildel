import React from 'react';
import { Link } from '@remix-run/react';
import type { LinkProps } from '@remix-run/react';

export const BasicLink: React.FC<LinkProps> = ({ children, ...props }) => {
  return (
    <Link prefetch="intent" {...props}>
      {children}
    </Link>
  );
};
