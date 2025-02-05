import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { PageSearch } from '~/components/search/PageSearch';
import { Button } from '~/components/ui/button';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import { DatasetsList } from './DatasetsList';
import type { loader } from './loader.server';

export function DatasetsPage() {
  const { organizationId, datasets, search } = useLoaderData<typeof loader>();

  return (
    <>
      <AppNavbar leftContent={<AppNavbarHeading>Datasets</AppNavbarHeading>} />

      <Outlet />

      <PageContentWrapper className="mt-6">
        <div className="mb-10 -mt-1 gap-2 flex justify-end">
          <PageSearch placeholder="Search Datasets" defaultValue={search} />

          <Button size="sm" asChild>
            <BasicLink to={routes.datasetsNew(organizationId)}>
              New Dataset
            </BasicLink>
          </Button>
        </div>

        <DatasetsList organizationId={organizationId} items={datasets} />
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Datasets',
    },
  ];
});
