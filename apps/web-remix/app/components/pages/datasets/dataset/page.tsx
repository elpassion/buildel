import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
import { confirm } from '~/components/modal/confirm';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { BreadcrumbWrapper } from '~/components/pages/experiments/components/Breadcrumb.components';
import { Breadcrumbs } from '~/components/pages/experiments/components/Breadcrumbs';
import {
  FloatingListActions,
  ListActionProvider,
} from '~/components/pages/knowledgeBase/components/ListActionProvider';
import { Pagination } from '~/components/pagination/Pagination';
import { Button } from '~/components/ui/button';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import { DatasetRowTable } from './DatasetRowTable/DatasetRowTable';
import type { loader } from './loader.server';
import { UploadFileForm } from './UploadFileForm';

export function DatasetPage() {
  const { organizationId, dataset, datasetRows, pagination } =
    useLoaderData<typeof loader>();

  return (
    <>
      <AppNavbar
        leftContent={
          <AppNavbarHeading>Dataset {dataset.name}</AppNavbarHeading>
        }
      >
        <div className="gap-2 justify-end hidden lg:flex">
          <UploadFileForm />
          <Button asChild className="">
            <BasicLink
              to={routes.datasetRowNew(organizationId, dataset.id, {
                page: pagination.page,
                per_page: pagination.per_page,
              })}
            >
              New Row
            </BasicLink>
          </Button>
        </div>
      </AppNavbar>

      <BreadcrumbWrapper>
        <Breadcrumbs
          pathConfig={{
            datasetId: dataset.name,
            datasets: {
              url: routes.datasets(organizationId),
              content: 'Datasets',
            },
          }}
        />
      </BreadcrumbWrapper>

      <PageContentWrapper className="mt-[110px] pb-3">
        <div className="mb-[56px] flex justify-end gap-2 lg:hidden">
          <UploadFileForm size="sm" />

          <Button size="sm" asChild>
            <BasicLink
              to={routes.datasetRowNew(organizationId, dataset.id, {
                page: pagination.page,
                per_page: pagination.per_page,
              })}
            >
              New Row
            </BasicLink>
          </Button>
        </div>

        <ListActionProvider>
          <DatasetRowTable data={datasetRows.data} />

          <FloatingListActions
            onDelete={(fetcher, ids) => {
              confirm({
                children: (
                  <p className="text-sm">
                    You are about to delete the {ids.length} Dataset Rows from
                    your. This action is irreversible.
                  </p>
                ),
                onConfirm: async () => {
                  fetcher.submit(
                    { rowIds: ids, intent: 'DELETE_MANY' },
                    { method: 'delete', encType: 'application/json' },
                  );
                },
              });
            }}
          />
        </ListActionProvider>

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

export const meta: MetaFunction<typeof loader> = metaWithDefaults(
  ({ data }) => {
    return [
      {
        title: `Dataset ${data?.dataset.name}`,
      },
    ];
  },
);
