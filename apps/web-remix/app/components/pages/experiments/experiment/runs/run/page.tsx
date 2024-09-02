import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Download } from 'lucide-react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { BreadcrumbWrapper } from '~/components/pages/experiments/components/Breadcrumb.components';
import { Breadcrumbs } from '~/components/pages/experiments/components/Breadcrumbs';
import {
  DatasetCard,
  WorkflowCard,
} from '~/components/pages/experiments/experiment/runs/components/ExperimentCard.components';
import { Pagination } from '~/components/pagination/Pagination';
import { errorToast } from '~/components/toasts/errorToast';
import { Button } from '~/components/ui/button';
import { downloadFile } from '~/hooks/useDownloadFile';
import { useRevalidateOnInterval } from '~/hooks/useRevalidateOnInterval';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import { ExperimentRunRunsCharts } from './components/ExperimentRunRunsCharts';
import { ExperimentRunRunsTable } from './components/ExperimentRunRunsTable';
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

  const downloadCsv = async () => {
    try {
      const res = await fetch(
        `/super-api/organizations/${organizationId}/experiments/${experimentId}/runs/${experimentRun.id}/runs/export`,
        { method: 'GET' },
      );

      if (!res.ok) throw new Error();

      const blob = await res.blob();
      downloadFile(blob, `experiment_run_${experimentId}.csv`);
    } catch (err) {
      console.log(err);
      errorToast('Cannot download the file');
    }
  };

  return (
    <>
      <AppNavbar
        leftContent={
          <AppNavbarHeading>
            Experiment {experiment.name} | {runId}
          </AppNavbarHeading>
        }
      />

      <BreadcrumbWrapper>
        <Breadcrumbs
          pathConfig={{
            runId: `Run: ${experimentRun.id}`,
            experimentId: {
              url: routes.experiment(organizationId, experimentId),
              content: experiment.name,
            },
            experiments: {
              url: routes.experiments(organizationId),
              content: 'Experiments',
            },
          }}
        />
      </BreadcrumbWrapper>

      <PageContentWrapper className="mt-[120px] pb-3">
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="w-full flex flex-col sm:flex-row gap-4 h-full shrink-0">
            <BasicLink
              className="block grow"
              to={routes.pipelineBuild(organizationId, experiment.pipeline.id)}
            >
              <WorkflowCard data={experiment.pipeline} />
            </BasicLink>

            <BasicLink
              className="block grow"
              to={routes.dataset(organizationId, experiment.dataset.id)}
            >
              <DatasetCard data={experiment.dataset} />
            </BasicLink>
          </div>

          <div className="grow">
            <ExperimentRunRunsCharts />
          </div>
        </div>

        <div className="mb-3 flex justify-end">
          <Button
            size="xs"
            variant="secondary"
            className="gap-1"
            onClick={downloadCsv}
          >
            <span>Export</span>
            <Download className="w-4 h-4" />
          </Button>
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

export const meta: MetaFunction<typeof loader> = metaWithDefaults(
  ({ data }) => {
    return [
      {
        title: `Experiment Run ${data?.runId}`,
      },
    ];
  },
);
