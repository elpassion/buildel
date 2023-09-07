import React from 'react';
import { Layout } from '~/modules/Layout';
import { OrganizationsApi } from '~api/Organizations/OrganizationsApi';
export default async function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationApi = new OrganizationsApi();

  // const organizations = await organizationApi.getAll();
  //
  // console.log(organizations);

  return <Layout>{children}</Layout>;
}
