import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData, useMatch, useNavigate } from '@remix-run/react';

import { EditBlockForm } from '~/components/pages/pipelines/EditBlockForm';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';

export function BlockConfigPage() {
  const { organizationId, pipelineId, runId, block, pipelineRun } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const match = useMatch(
    '/:organizationId/pipelines/:pipelineId/runs/:runId/overview/blocks/:blockName',
  );
  const isSidebarOpen = !!match;

  const closeSidebar = (value: boolean) => {
    if (value) return;
    navigate(routes.pipelineRunOverview(organizationId, pipelineId, runId));
  };

  return (
    <DialogDrawer open={isSidebarOpen} onOpenChange={closeSidebar}>
      <DialogDrawerContent className="md:max-w-[700px] md:w-[600px] lg:w-[700px]">
        <DialogDrawerHeader>
          <DialogDrawerTitle>{block.name}</DialogDrawerTitle>
          <DialogDrawerDescription>
            {block.block_type?.description}
          </DialogDrawerDescription>
        </DialogDrawerHeader>

        <DialogDrawerBody>
          <EditBlockForm
            disabled
            blockConfig={block}
            organizationId={organizationId}
            pipelineId={pipelineRun.id}
          />
        </DialogDrawerBody>
      </DialogDrawerContent>
    </DialogDrawer>
  );
}

export const meta: MetaFunction<typeof loader> = metaWithDefaults(
  ({ data }) => {
    return [
      {
        title: `${data?.block.name} block`,
      },
    ];
  },
);
