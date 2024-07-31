import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { DatasetRowTable } from '~/components/pages/datasets/overview/DatasetRowTable/DatasetRowTable';
import { Pagination } from '~/components/pagination/Pagination';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';

export function DatasetPage() {
  const { organizationId, dataset, datasetRows, pagination } =
    useLoaderData<typeof loader>();

  return (
    <>
      <AppNavbar
        leftContent={
          <AppNavbarHeading>Dataset {dataset.name}</AppNavbarHeading>
        }
      />

      <PageContentWrapper className="mt-[120px] pb-3">
        <DatasetRowTable data={datasetRows.data} />

        <div className="flex justify-end mt-4">
          <Pagination
            pagination={pagination}
            loaderUrl={routes.dataset(organizationId, dataset.id)}
          />
        </div>
      </PageContentWrapper>

      <Outlet />
    </>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `Dataset ${data?.dataset.name}`,
    },
  ];
};
