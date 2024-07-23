import type { PropsWithChildren } from 'react';
import React from 'react';
import { useLoaderData } from '@remix-run/react';

import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import type { loader } from '~/components/pages/pipelines/list/loader.server';

export const PipelinesNavbar = ({ children }: PropsWithChildren) => {
  return <AppNavbar leftContent={<LeftContent />}>{children}</AppNavbar>;
};

function LeftContent() {
  const { organizationId } = useLoaderData<typeof loader>();
  return (
    <div className="flex items-center justify-center gap-2">
      <AppNavbarHeading data-testid={`organization-${organizationId}`}>
        Workflows
      </AppNavbarHeading>
    </div>
  );
}
