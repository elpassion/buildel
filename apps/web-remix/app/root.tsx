import type { LinksFunction } from '@remix-run/node';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { withSentry } from '@sentry/remix';

import { Toaster } from '~/components/toasts/Toaster';

import './tailwind.css';

import { ErrorBoundaryLayout } from '~/components/errorBoundaries/ErrorBoundaryLayout';
import { RootErrorBoundary } from '~/components/errorBoundaries/RootErrorBoundary';
import { PageProgress } from '~/components/progressBar/PageProgress';
import { useNonce } from '~/utils/nonce-provider';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@500&display=swap',
  },
];

function Document({
  children,
  nonce,
}: {
  children: React.ReactNode;
  nonce: string;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <script
          nonce={nonce}
          defer
          data-domain="app.buildel.ai"
          src="/statistics/script.js"
        ></script>
      </head>
      <body className="bg-white text-foreground">
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

function App() {
  const nonce = useNonce();

  return (
    <Document nonce={nonce}>
      <Toaster />
      <PageProgress />
      <Outlet />
    </Document>
  );
}

export default withSentry(App);

export function ErrorBoundary() {
  const nonce = useNonce();
  return (
    <ErrorBoundaryLayout nonce={nonce} className="bg-white text-foreground">
      <RootErrorBoundary />
    </ErrorBoundaryLayout>
  );
}
