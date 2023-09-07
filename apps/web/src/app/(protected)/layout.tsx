import React from 'react';
import type { Metadata } from 'next';
import { APP_DESCRIPTION, APP_NAME } from '~/modules/Config';
import { Layout } from '~/modules/Layout';

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}
