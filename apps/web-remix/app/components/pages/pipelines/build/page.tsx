import React, { useCallback } from 'react';
import type { MetaFunction } from '@remix-run/node';
import {
  Outlet,
  useFetcher,
  useLoaderData,
  useMatch,
  useNavigate,
  useRevalidator,
  useSearchParams,
} from '@remix-run/react';
import isEqual from 'lodash.isequal';

import { AliasNode } from '~/components/pages/pipelines/build/AliasNode';
import { ELProvider } from '~/components/pages/pipelines/EL/ELProvider';
import { ActionSidebar } from '~/components/sidebar/ActionSidebar';
import { routes } from '~/utils/routes.utils';

import { Builder } from '../Builder';
import { CustomEdge } from '../CustomEdges/CustomEdge';
import type { IPipeline, IPipelineConfig } from '../pipeline.types';
import { toPipelineConfig } from '../PipelineFlow.utils';
import { BuilderHeader, SaveChangesButton } from './BuilderHeader';
import { BuilderNode } from './BuilderNode';
import { CreateBlockFloatingMenu } from './CreateBlock/CreateBlockFloatingMenu';
import { PasteBlockConfiguration } from './CreateBlock/PastConfigSidebar';
import { PasteBlockConfigProvider } from './CreateBlock/PasteBlockConfigProvider';
import type { loader } from './loader.server';

export function PipelineBuilder() {
  const revalidator = useRevalidator();
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

  const handleRevalidate = () => {
    revalidator.revalidate();
  };

  const handleCloseSidebar = () => {
    navigate(
      routes.pipelineBuild(
        organizationId,
        pipelineId,
        Object.fromEntries(searchParams.entries()),
      ),
    );
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
    <>
      <Builder
        alias={aliasId}
        key="flow-editable"
        pipeline={pipeline}
        CustomNode={BuilderNode}
        CustomEdge={CustomEdge}
        className="h-[calc(100vh_-_128px)]"
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
              {/*<ELHelper*/}
              {/*  pipelineId={pipelineId}*/}
              {/*  organizationId={organizationId}*/}
              {/*  onBlockCreate={handleRevalidate}*/}
              {/*/>*/}
              <PasteBlockConfigProvider>
                <CreateBlockFloatingMenu onCreate={onBlockCreate} />

                <PasteBlockConfiguration onSubmit={onBlockCreate} />
              </PasteBlockConfigProvider>
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
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Build',
    },
  ];
};
