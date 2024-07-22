import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { MonthPicker } from '~/components/pages/pipelines/MonthPicker/MonthPicker';
import { PipelineRunsTable } from '~/components/pages/pipelines/overview/PipelineRunsTable';
import { Pagination } from '~/components/pagination/Pagination';
import { dayjs } from '~/utils/Dayjs';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';

export function OverviewPage() {
  const {
    pipelineRuns: runs,
    pipelineId,
    organizationId,
    pagination,
    details,
    startDate,
    endDate,
  } = useLoaderData<typeof loader>();

  return (
    <PageContentWrapper>
      <section className="pt-5 pb-1">
        <header className="w-full flex items-center justify-between py-2 mb-4">
          <p className="text-foreground">
            <span className="text-muted-foreground">Summary cost ($):</span>{' '}
            {details.total_cost}
          </p>

          <div className="w-[170px]">
            <MonthPicker
              date={new Date(startDate)}
              loaderUrl={routes.pipelineRuns(organizationId, pipelineId)}
            />
          </div>
        </header>

        <div className="overflow-x-auto">
          <div className="min-w-[750px] pb-3">
            <PipelineRunsTable
              data={runs}
              organizationId={organizationId}
              pipelineId={pipelineId}
            />

            <div className="flex justify-end mt-4">
              <Pagination
                pagination={pagination}
                loaderUrl={routes.pipelineRuns(organizationId, pipelineId, {
                  start_date: dayjs(startDate).startOfMonth.toISOString(),
                  end_date: dayjs(endDate).endOfMonth.toISOString(),
                })}
              />
            </div>
          </div>
        </div>
      </section>
    </PageContentWrapper>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Pipeline overview',
    },
  ];
};
