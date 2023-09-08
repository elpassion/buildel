import React from 'react';
import type { Metadata } from 'next';
import { APP_DESCRIPTION, APP_NAME } from '~/modules/Config';
import { Layout } from '~/modules/Layout';
import { AuthProvider } from './AuthProvider';
import { AuthApi } from '~api/Auth/AuthApi';
import { cookies } from 'next/headers';
import { HttpClient } from '~/utils';
import { ENV } from '~/env.mjs';

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authApi = new AuthApi(
    new HttpClient({
      url: `${ENV.PAGE_URL}/api`,
      authCookie: cookies().get('_buildel_key')?.value,
    }),
  );
  const data = await authApi.me();

  return (
    <AuthProvider initialUser={data.data}>
      <Layout>{children}</Layout>
    </AuthProvider>
  );
}
