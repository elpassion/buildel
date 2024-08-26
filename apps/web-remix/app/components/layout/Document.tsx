import React from 'react';
import { Links, Meta, Scripts, ScrollRestoration } from '@remix-run/react';

export function Document({
  children,

  //eslint-disable-next-line
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
        <script
          defer
          data-domain="app.buildel.ai"
          src="/statistics/script.js"
        ></script>
      </head>
      <body className="bg-white text-foreground">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
