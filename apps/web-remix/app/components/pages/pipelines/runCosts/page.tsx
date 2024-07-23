import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';

import type { loader } from './loader.server';
import {
  PipelineRunCostsList,
  PipelineRunCostsListHeader,
} from './RunsCostsList';

export function PipelineRunCosts() {
  const { pipelineRun } = useLoaderData<typeof loader>();

  return (
    <PageContentWrapper className="py-10">
      <section className="overflow-x-auto">
        <div className="min-w-[450px]">
          {pipelineRun.costs.length > 0 ? <PipelineRunCostsListHeader /> : null}

          <PipelineRunCostsList items={pipelineRun.costs} />
        </div>
      </section>
    </PageContentWrapper>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: `Costs details`,
    },
  ];
};
