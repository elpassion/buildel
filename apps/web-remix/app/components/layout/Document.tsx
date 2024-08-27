import React from 'react';
import { Links, Meta, Scripts, ScrollRestoration } from '@remix-run/react';

import { PageProgress } from '~/components/progressBar/PageProgress';
import { Toaster } from '~/components/toasts/Toaster';

export function Document({
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
        <meta httpEquiv=" Content-Type" content="text/html;charset=utf-8" />

        <Meta />
        <Links />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@500&display=swap"
        />

        <script
          nonce={nonce}
          defer
          data-domain="app.buildel.ai"
          src="/statistics/script.js"
        ></script>
      </head>

      <body className="bg-white text-foreground">
        {children}
        <Toaster />
        <PageProgress />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}
