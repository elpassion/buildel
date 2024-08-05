import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useFetcher, useLoaderData } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { Pagination } from '~/components/pagination/Pagination';
import type { ButtonProps } from '~/components/ui/button';
import { Button } from '~/components/ui/button';
import { useRevalidateOnInterval } from '~/hooks/useRevalidateOnInterval';
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

  const isRunning = experimentRuns.some((run) => run.status === 'running');

  useRevalidateOnInterval({ enabled: isRunning });

  return (
    <>
      <AppNavbar
        leftContent={
          <AppNavbarHeading>Experiment {experiment.name}</AppNavbarHeading>
        }
      >
        <ExperimentRunButton className="w-fit ml-auto mr-0 hidden lg:flex">
          Run Experiment
        </ExperimentRunButton>
      </AppNavbar>

      <PageContentWrapper className="mt-6 lg:mt-[120px] pb-3">
        <div className="mb-[56px] flex justify-end lg:hidden">
          <ExperimentRunButton size="sm">Run Experiment</ExperimentRunButton>
        </div>

        <ExperimentRunsTable data={experimentRuns} />

        <div className="flex justify-end mt-4">
          <Pagination
            pagination={pagination}
            loaderUrl={routes.experimentRuns(organizationId, experimentId)}
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

function ExperimentRunButton({ children, ...props }: ButtonProps) {
  const fetcher = useFetcher();

  const onClick = () => {
    fetcher.submit({}, { method: 'POST' });
  };

  return (
    <Button {...props} onClick={onClick}>
      {children}
    </Button>
  );
}
