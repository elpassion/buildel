import React from "react";
import { isRouteErrorResponse } from "@remix-run/react";
import { captureRemixErrorBoundaryError } from "@sentry/remix";

interface GlobalRuntimeProps {
  error: unknown;
}

//@todo setup sentry
export const GlobalRuntime: React.FC<GlobalRuntimeProps> = ({ error }) => {
  const status = isRouteErrorResponse(error) ? error.status : 500;

  captureRemixErrorBoundaryError(error);
  return (
    <section className="w-full min-h-screen flex items-center justify-center flex-col">
      <h2 className="text-6xl font-bold">{status}</h2>
      <p className="font-medium text-xl">Ooops!</p>
      <h1 className="font-medium text-xl">Internal server error</h1>
      <p className="text-sm">
        Please try again later or feel free to contact us if the problem
        persists
      </p>
    </section>
  );
};
