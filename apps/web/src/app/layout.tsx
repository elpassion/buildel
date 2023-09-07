import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { APP_DESCRIPTION, APP_NAME } from '~/modules/Config';
import { AppProviders } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
