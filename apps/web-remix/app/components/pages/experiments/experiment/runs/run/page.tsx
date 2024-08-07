import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { Pagination } from '~/components/pagination/Pagination';
import { useRevalidateOnInterval } from '~/hooks/useRevalidateOnInterval';
import { routes } from '~/utils/routes.utils';

import { ExperimentRunRunsTable } from './ExperimentRunRunsTable/ExperimentRunRunsTable';
import type { loader } from './loader.server';
import { RunRunsChartGrid } from './RunRunsCharts/RunRunsChartGrid';

export function ExperimentRunPage() {
  const {
    organizationId,
    experimentId,
    experiment,
    experimentRun,
    experimentRunRuns,
    runId,
    pagination,
  } = useLoaderData<typeof loader>();

  useRevalidateOnInterval({
    enabled: experimentRun.status === 'running',
  });

  return (
    <>
      <AppNavbar
        leftContent={
          <AppNavbarHeading>
            Experiment {experiment.name} | {runId}
          </AppNavbarHeading>
        }
      />

      <PageContentWrapper className="mt-[100px] pb-3">
        <div className="mb-4">
          <RunRunsChartGrid
            data={experimentRunRuns}
            columns={experimentRun.columns.outputs}
          />
        </div>

        <ExperimentRunRunsTable
          data={experimentRunRuns}
          dynamicColumns={experimentRun.columns}
        />

        <div className="flex justify-end mt-4">
          <Pagination
            pagination={pagination}
            loaderUrl={routes.experimentRun(
              organizationId,
              experimentId,
              runId,
            )}
          />
        </div>
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `Experiment Run ${data?.runId}`,
    },
  ];
};
