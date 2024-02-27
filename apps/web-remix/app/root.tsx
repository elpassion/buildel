import { withSentry } from "@sentry/remix";
import type { LinksFunction } from "@remix-run/node";
import Modal from "react-modal";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Toaster } from "~/components/toasts/Toaster";
import "./tailwind.css";
import { PageProgress } from "~/components/progressBar/PageProgress";
import { RootErrorBoundary } from "~/components/errorBoundaries/RootErrorBoundary";
import { ErrorBoundaryLayout } from "~/components/errorBoundaries/ErrorBoundaryLayout";

Modal.setAppElement("#_root");

export const links: LinksFunction = () => [
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
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Roboto:wght@500&display=swap",
  },
];

function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <script
          defer
          data-domain="app.buildel.ai"
          src="/statistics/script.js"
        ></script>
      </head>
      <body className="bg-neutral-950">
        <Toaster />
        <PageProgress />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default withSentry(App);

export function ErrorBoundary() {
  return (
    <ErrorBoundaryLayout className="bg-neutral-950 text-white">
      <RootErrorBoundary />
    </ErrorBoundaryLayout>
  );
}
