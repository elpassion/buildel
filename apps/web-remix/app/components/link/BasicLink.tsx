import React from 'react';
import { Link } from '@remix-run/react';
import type { LinkProps } from '@remix-run/react';

export type BasicLinkProps = LinkProps;

export const BasicLink: React.FC<BasicLinkProps> = ({ children, ...props }) => {
  return (
    <Link prefetch="intent" {...props}>
      {children}
    </Link>
  );
};
