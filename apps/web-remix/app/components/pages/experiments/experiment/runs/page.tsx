import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useFetcher, useLoaderData } from '@remix-run/react';
import { Download } from 'lucide-react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { BreadcrumbWrapper } from '~/components/pages/experiments/components/Breadcrumb.components';
import { Breadcrumbs } from '~/components/pages/experiments/components/Breadcrumbs';
import { Pagination } from '~/components/pagination/Pagination';
import type { ButtonProps } from '~/components/ui/button';
import { Button } from '~/components/ui/button';
import { useRevalidateOnInterval } from '~/hooks/useRevalidateOnInterval';
import { cn } from '~/utils/cn';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import {
  DatasetCard,
  WorkflowCard,
} from './components/ExperimentCard.components';
import { ExperimentRunsCharts } from './components/ExperimentRunsCharts';
import { ExperimentRunsTable } from './components/ExperimentRunsTable';
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
          <AppNavbarHeading className="line-clamp-1" title={experiment.name}>
            Experiment {experiment.name}
          </AppNavbarHeading>
        }
      >
        <ExperimentRunButton className="w-fit ml-auto mr-0 hidden lg:flex">
          Run Experiment
        </ExperimentRunButton>
      </AppNavbar>

      <BreadcrumbWrapper>
        <Breadcrumbs
          pathConfig={{
            experimentId: experiment.name,
            experiments: {
              url: routes.experiments(organizationId),
              content: 'Experiments',
            },
          }}
        />
      </BreadcrumbWrapper>

      <PageContentWrapper className="pt-[110px] pb-3">
        <div className="mb-6 flex justify-end lg:hidden">
          <ExperimentRunButton size="sm">Run Experiment</ExperimentRunButton>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8 lg:grid-cols-[1fr_2fr]">
          <div className="flex flex-col sm:flex-row gap-4 h-full lg:flex-col">
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

          <div className={cn('w-full')}>
            <ExperimentRunsCharts />
          </div>
        </div>

        <div className="mb-3 flex justify-end">
          <Button size="xs" variant="secondary" className="gap-1" asChild>
            <a
              href={`/super-api/organizations/${organizationId}/experiments/${experimentId}/runs/export`}
            >
              <span>Export</span>
              <Download className="w-4 h-4" />
            </a>
          </Button>
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

export const meta: MetaFunction<typeof loader> = metaWithDefaults(
  ({ data }) => {
    return [
      {
        title: `Experiment ${data?.experiment.name}`,
      },
    ];
  },
);

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
