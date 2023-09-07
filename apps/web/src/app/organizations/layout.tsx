import React from 'react';
import { Layout } from '~/modules/Layout';
export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}
