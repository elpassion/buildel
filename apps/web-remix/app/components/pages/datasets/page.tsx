import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { Button } from '~/components/ui/button';
import { routes } from '~/utils/routes.utils';

import { DatasetsList } from './DatasetsList';
import type { loader } from './loader.server';

export function DatasetsPage() {
  const { organizationId, datasets } = useLoaderData<typeof loader>();

  return (
    <>
      <AppNavbar leftContent={<AppNavbarHeading>Datasets</AppNavbarHeading>}>
        <Button asChild className="w-fit ml-auto mr-0 hidden lg:flex">
          <BasicLink to={routes.datasetsNew(organizationId)}>
            New Dataset
          </BasicLink>
        </Button>
      </AppNavbar>

      <Outlet />

      <PageContentWrapper className="mt-6">
        <div className="mb-3 flex justify-end lg:hidden">
          <Button size="sm" asChild>
            <BasicLink to={routes.knowledgeBaseNew(organizationId)}>
              New Dataset
            </BasicLink>
          </Button>
        </div>

        <DatasetsList organizationId={organizationId} items={datasets} />
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Datasets',
    },
  ];
};
