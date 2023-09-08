import React, { PropsWithChildren, ReactNode } from 'react';
import type { Metadata, NextComponentType, NextPageContext } from 'next';
import { cookies } from 'next/headers';
import { AuthApi } from '~api/Auth/AuthApi';
import { ENV } from '~/env.mjs';
import { APP_DESCRIPTION, APP_NAME } from '~/modules/Config';
import { Layout } from '~/modules/Layout';
import { HttpClient } from '~/utils';
import { AuthProvider } from './AuthProvider';

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export const withSSRSession = (
  Component: (props: any) => Promise<React.JSX.Element>,
) => {
  const WrappedComponent = (props: any) => {
    const authCookie = cookies().get('_buildel_key')?.value;

    const httpClient = new HttpClient({
      url: `${ENV.PAGE_URL}/api`,
      authCookie,
    });

    return <Component {...props} serverHttpClient={httpClient} />;
  };

  return WrappedComponent;
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
