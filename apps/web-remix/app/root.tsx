import { Outlet } from '@remix-run/react';
import { withSentry } from '@sentry/remix';

import { RootErrorBoundary } from '~/components/errorBoundaries/RootErrorBoundary';
import { Document } from '~/components/layout/Document';
import { useNonce } from '~/utils/nonce-provider';

import './tailwind.css';

function App() {
  const nonce = useNonce();
  return (
    <Document nonce={nonce}>
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
