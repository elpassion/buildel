import type { LinksFunction } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { withSentry } from '@sentry/remix';

import { Toaster } from '~/components/toasts/Toaster';

import './tailwind.css';

import { RootErrorBoundary } from '~/components/errorBoundaries/RootErrorBoundary';
import { Document } from '~/components/layout/Document';
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
    <Document nonce={nonce}>
      <RootErrorBoundary />
    </Document>
  );
}
