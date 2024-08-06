import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import startCase from 'lodash.startcase';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { Pagination } from '~/components/pagination/Pagination';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { useRevalidateOnInterval } from '~/hooks/useRevalidateOnInterval';
import { routes } from '~/utils/routes.utils';

import { ExperimentRunRunsTable } from './ExperimentRunRunsTable/ExperimentRunRunsTable';
import type { loader } from './loader.server';
import { RunRunsNumericChart } from './RunCharts/RunRunsNumericChart';

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

      <PageContentWrapper className="mt-[120px] pb-3">
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {experimentRun.columns.outputs.map((column) => {
            if (!isNumeric(experimentRunRuns[0]?.data?.[column])) return null;

            return (
              <Card key={column}>
                <CardHeader>
                  <CardTitle>{startCase(column)}</CardTitle>
                  <CardDescription>
                    Show the values of the{' '}
                    <span className="font-bold">{column}</span> column in the
                    experiment run runs.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <RunRunsNumericChart
                    column={column}
                    data={experimentRunRuns}
                  />
                </CardContent>
              </Card>
            );
          })}
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

function isNumeric(value: any) {
  return !isNaN(parseFloat(value));
}
