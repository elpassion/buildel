import React from 'react';
import { cookies } from 'next/headers';
import { ENV } from '~/env.mjs';
import { HttpClient } from '~/utils/HttpClient';

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
