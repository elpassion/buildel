import type { PropsWithChildren } from 'react';
import React from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  useRouteError,
} from '@remix-run/react';

export const ErrorBoundaryLayout: React.FC<
  PropsWithChildren<{ className?: string }>
> = ({ children, className }) => {
  const error = useRouteError();
  const getTitle = () => {
    if (isRouteErrorResponse(error)) {
      if (error.status === 404) return 'Not Found';
      return 'Something went wrong';
    }
  };
  return (
    <html>
      <head>
        <title>{getTitle()}</title>
        <Meta />
        <Links />
      </head>
      <body className={className}>
        {children}
        <Scripts />
      </body>
    </html>
  );
};
