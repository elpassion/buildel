import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

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

      <PageContentWrapper className="mt-[120px]">
        <div className="pb-3 overflow-x-auto">
          <DatasetRowTable data={datasetRows.data} className="min-w-[1000px]" />

          <div className="flex justify-end mt-4">
            <Pagination
              pagination={pagination}
              loaderUrl={routes.dataset(organizationId, dataset.id)}
            />
          </div>
        </div>
      </PageContentWrapper>
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
