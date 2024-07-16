import { startTransition, StrictMode, useEffect } from 'react';
/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { hydrateRoot } from 'react-dom/client';
import { RemixBrowser, useLocation, useMatches } from '@remix-run/react';
import * as Sentry from '@sentry/remix';

Sentry.init({
  dsn: '',
  tracesSampleRate: 1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  enabled: false,
  ignoreErrors: [
    'Event `Event` (type=error) captured as promise rejection',
    'Validate called before form was initialized.',
    'Object captured as promise rejection with keys: msg, type',
  ],
  beforeSend(event, hint) {
    if (event.level === 'warning') {
      return null;
    }

    return event;
  },

  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.remixRouterInstrumentation(
        useEffect,
        useLocation,
        useMatches,
      ),
    }),
    new Sentry.Replay(),
  ],
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  );
});
