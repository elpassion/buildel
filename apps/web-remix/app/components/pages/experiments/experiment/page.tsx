import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { Pagination } from '~/components/pagination/Pagination';
import { Button } from '~/components/ui/button';
import { routes } from '~/utils/routes.utils';

import { ExperimentRunsTable } from './ExperimentRunsTable/ExperimentRunsTable';
import type { loader } from './loader.server';

export function ExperimentPage() {
  const {
    organizationId,
    experimentId,
    experiment,
    experimentRuns,
    pagination,
  } = useLoaderData<typeof loader>();

  return (
    <>
      <AppNavbar
        leftContent={
          <AppNavbarHeading>Experiment {experiment.name}</AppNavbarHeading>
        }
      >
        <Button asChild className="w-fit ml-auto mr-0 hidden lg:flex">
          <BasicLink to={routes.experiment(organizationId, experimentId)}>
            Run Experiment
          </BasicLink>
        </Button>
      </AppNavbar>

      <PageContentWrapper className="mt-6 lg:mt-[120px] pb-3">
        <div className="mb-[56px] flex justify-end lg:hidden">
          <Button size="sm" asChild>
            <BasicLink to={routes.experiment(organizationId, experimentId)}>
              Run Experiment
            </BasicLink>
          </Button>
        </div>

        <ExperimentRunsTable data={experimentRuns} />

        <div className="flex justify-end mt-4">
          <Pagination
            pagination={pagination}
            loaderUrl={routes.experiment(organizationId, experimentId)}
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
      title: `Experiment ${data?.experiment.name}`,
    },
  ];
};
