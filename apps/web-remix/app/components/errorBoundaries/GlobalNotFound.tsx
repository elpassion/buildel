import React from 'react';
import type { ErrorResponse } from '@remix-run/node';
import { Link } from '@remix-run/react';

import { routes } from '~/utils/routes.utils';

interface GlobalNotFoundProps {
  error: ErrorResponse;
}

export const GlobalNotFound: React.FC<GlobalNotFoundProps> = ({ error }) => {
  return (
    <section className="w-full min-h-screen flex items-center justify-center flex-col">
      <h2 className="text-6xl font-bold">{error.status}</h2>
      <p className="font-medium text-xl">Ooops!</p>
      <h1 className="font-medium text-xl">Page Not Found</h1>
      <Link to={routes.dashboard} className="mt-1 text-foreground font-bold">
        Back to homepage
      </Link>
    </section>
  );
};
