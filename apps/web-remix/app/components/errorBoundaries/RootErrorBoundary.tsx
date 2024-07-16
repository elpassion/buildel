import { isRouteErrorResponse, useRouteError } from '@remix-run/react';

import { GlobalNotFound } from './GlobalNotFound';
import { GlobalRuntime } from './GlobalRuntime';

export function RootErrorBoundary() {
  const error = useRouteError();

  const renderErrorUi = () => {
    if (isRouteErrorResponse(error)) {
      if (error.status === 404) return <GlobalNotFound error={error} />;
    }

    return <GlobalRuntime error={error} />;
  };

  return renderErrorUi();
}
