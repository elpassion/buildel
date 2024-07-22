import React, { useCallback } from 'react';
import type { MetaFunction } from '@remix-run/node';
import {
  Outlet,
  useFetcher,
  useLoaderData,
  useMatch,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import isEqual from 'lodash.isequal';
import { ChevronLeft } from 'lucide-react';

import { AliasNode } from '~/components/pages/pipelines/build/AliasNode';
import { ELProvider } from '~/components/pages/pipelines/EL/ELProvider';
import { ActionSidebar } from '~/components/sidebar/ActionSidebar';
import { Button } from '~/components/ui/button';
import { routes } from '~/utils/routes.utils';

import { Builder } from '../Builder';
import { CustomEdge } from '../CustomEdges/CustomEdge';
import type { IPipeline, IPipelineConfig } from '../pipeline.types';
import { toPipelineConfig } from '../PipelineFlow.utils';
import { BuilderHeader, SaveChangesButton } from './BuilderHeader';
import { BuilderNode } from './BuilderNode';
import { CreateBlockFloatingMenu } from './CreateBlock/CreateBlockFloatingMenu';
import type { loader } from './loader.server';

export function PipelineBuilder() {
  const updateFetcher = useFetcher<IPipeline>();
  const [searchParams] = useSearchParams();
  const { pipeline, pipelineId, organizationId, aliasId } =
    useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const match = useMatch(
    '/:organizationId/pipelines/:pipelineId/build/blocks/:blockName',
  );
  const isSidebarOpen = !!match;

  const handleUpdatePipeline = useCallback(
    (config: IPipelineConfig) => {
      if (isEqual(pipeline.config, config)) return;
      updateFetcher.submit(
        { ...pipeline, config: { ...config } },
        { method: 'PUT', encType: 'application/json' },
      );
    },
    [updateFetcher, pipeline],
  );

  const handleCloseSidebar = () => {
    navigate(
      routes.pipelineBuild(
        organizationId,
        pipelineId,
        Object.fromEntries(searchParams.entries()),
      ),
    );
  };

  const backToWorkflows = () => {
    navigate(routes.pipelines(organizationId));
  };

  const isDisabled = aliasId !== 'latest';

  if (isDisabled) {
    return (
      <Builder
        alias={aliasId}
        key="flow-readOnly"
        type="readOnly"
        className="h-[calc(100vh_-_128px)]"
        pipeline={pipeline}
        CustomNode={AliasNode}
        CustomEdge={CustomEdge}
      >
        {() => <BuilderHeader />}
      </Builder>
    );
  }

  return (
    <div id="_root">
      <header className="w-full h-16 bg-white px-4 py-2 flex justify-between items-center">
        <Button variant="secondary" size="icon" onClick={backToWorkflows}>
          <ChevronLeft />
        </Button>
      </header>
      <Builder
        alias={aliasId}
        key="flow-editable"
        pipeline={pipeline}
        CustomNode={BuilderNode}
        CustomEdge={CustomEdge}
        className="h-[calc(100vh_-_64px)] pt-0"
      >
        {({ edges, nodes, onBlockCreate }) => (
          <>
            <BuilderHeader>
              <SaveChangesButton
                config={toPipelineConfig(nodes, edges)}
                isSaving={updateFetcher.state !== 'idle'}
                onSave={handleUpdatePipeline}
              />
            </BuilderHeader>

            <ELProvider>
              <CreateBlockFloatingMenu onCreate={onBlockCreate} />
            </ELProvider>
          </>
        )}
      </Builder>

      <ActionSidebar
        overlay
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        className="md:w-[460px] lg:w-[550px]"
      >
        <Outlet />
      </ActionSidebar>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Build',
    },
  ];
};
