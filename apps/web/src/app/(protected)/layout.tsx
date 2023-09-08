import React, { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { AuthApi } from '~api/Auth/AuthApi';
import { APP_DESCRIPTION, APP_NAME } from '~/modules/Config';
import { Layout } from '~/modules/Layout';
import { HttpClient } from '~/utils';
import { withSSRSession } from '~/utils/withSSRSession';
import { AuthProvider } from './AuthProvider';

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

interface ProtectedLayoutProps extends PropsWithChildren {
  serverHttpClient: HttpClient;
}
async function ProtectedLayout({
  children,
  serverHttpClient,
}: ProtectedLayoutProps) {
  const authApi = new AuthApi(serverHttpClient);
  const { data: user } = await authApi.me();

  return (
    <AuthProvider initialUser={user}>
      <Layout>{children}</Layout>
    </AuthProvider>
  );
}

export default withSSRSession(ProtectedLayout);
