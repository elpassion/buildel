import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { RunEvaluationAverageChart } from '~/components/pages/experiments/experiment/runs/run/RunRunsCharts/RunEvaluationAverageChart';
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
        <div className="mb-4 max-w-[350px]">
          {/*<RunRunsChartGrid*/}
          {/*  data={experimentRunRuns}*/}
          {/*  columns={experimentRun.columns.outputs}*/}
          {/*/>*/}

          <Card>
            <CardHeader>
              <CardTitle>Evaluation Average</CardTitle>
              <CardDescription>
                Average of the evaluation of all rows in the experiment run
                runs.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <RunEvaluationAverageChart
                average={experimentRun.evaluations_avg ?? 0}
              />
            </CardContent>
          </Card>
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
