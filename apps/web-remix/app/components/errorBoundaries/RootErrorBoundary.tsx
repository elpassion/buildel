import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { GlobalNotFound } from "./GlobalNotFound";
import { GlobalRuntime } from "./GlobalRuntime";
import { ErrorBoundaryLayout } from "./ErrorBoundaryLayout";

export function ErrorBoundary() {
  const error = useRouteError();

  const renderErrorUi = () => {
    if (isRouteErrorResponse(error)) {
      if (error.status === 404) return <GlobalNotFound error={error} />;
    }

    return <GlobalRuntime error={error} />;
  };

  return (
    <ErrorBoundaryLayout className="bg-neutral-950 text-white">
      {renderErrorUi()}
    </ErrorBoundaryLayout>
  );
}
