import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import { Toaster } from "~/components/toasts/Toaster";
import menuStyles from "rc-menu/assets/index.css";
import styles from "./tailwind.css";
import { GlobalNotFound } from "~/components/errorBoundaries/GlobalNotFound";
import { GlobalRuntime } from "~/components/errorBoundaries/GlobalRuntime";
export const links: LinksFunction = () => [
  ...(cssBundleHref
    ? [
        { rel: "stylesheet", href: cssBundleHref },
        { rel: "stylesheet", href: menuStyles },
      ]
    : [
        { rel: "stylesheet", href: styles },
        { rel: "stylesheet", href: menuStyles },
      ]),
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap",
  },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-neutral-950">
        <Toaster />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  const renderErrorUi = () => {
    if (isRouteErrorResponse(error)) {
      if (error.status === 404) return <GlobalNotFound error={error} />;
    }

    return <GlobalRuntime error={error} />;
  };

  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-neutral-950 text-white">
        {renderErrorUi()}
        <Scripts />
      </body>
    </html>
  );
}
