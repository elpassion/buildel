import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { redirect } from 'next/navigation';
import { APP_DESCRIPTION, APP_NAME, ROUTES } from '~/modules/Config';
import { Layout } from '~/modules/Layout';
import { OrganizationsApi } from '~api/Organizations';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationApi = new OrganizationsApi();

  const organizations = await organizationApi.getAll().catch((err) => {
    console.error(err);
    // redirect(ROUTES.SIGN_IN);
  });

  console.log(organizations);

  return <Layout>{children}</Layout>;
}
