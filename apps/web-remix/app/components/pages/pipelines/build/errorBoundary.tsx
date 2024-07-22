import React from 'react';
import { isRouteErrorResponse, useRouteError } from '@remix-run/react';

export const BuildErrorBoundary = () => {
  const error = useRouteError();

  const getStatus = () => {
    if (isRouteErrorResponse(error)) {
      return error.status;
    }

    return 500;
  };

  const status = getStatus();

  return (
    <div className="my-6 p-2 rounded-lg text-center">
      {status === 404 ? <NotFound /> : <Runtime />}
    </div>
  );
};

function NotFound() {
  return <p className="text-foreground text-sm">Page not found...</p>;
}

function Runtime() {
  return <p className="text-red-500 text-sm">Ups! Something went wrong...</p>;
}
