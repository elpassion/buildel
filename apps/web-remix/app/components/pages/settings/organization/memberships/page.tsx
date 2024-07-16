import React from 'react';
import { useLoaderData } from '@remix-run/react';

import type { loader } from './loader.server';
import { MembershipList } from './MembershipList';

export function MembershipsPage() {
  const { memberships } = useLoaderData<typeof loader>();

  return <MembershipList memberships={memberships} />;
}
