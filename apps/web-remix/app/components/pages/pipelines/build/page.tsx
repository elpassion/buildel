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
import { useBoolean } from 'usehooks-ts';

import { ELProvider } from '~/components/pages/pipelines/EL/ELProvider';
import { BuilderCommentNode } from '~/components/pages/pipelines/Nodes/CommentNodes/BuilderCommentNode';
import { ReadonlyCommentNode } from '~/components/pages/pipelines/Nodes/CommentNodes/ReadonlyCommentNode';
import { AliasCustomNode } from '~/components/pages/pipelines/Nodes/CustomNodes/AliasCustomNode';
import { BuilderCustomNode } from '~/components/pages/pipelines/Nodes/CustomNodes/BuilderCustomNode';
import {
  DialogDrawer,
  DialogDrawerContent,
} from '~/components/ui/dialog-drawer';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import { Builder } from '../Builder';
import { CustomEdge } from '../Edges/CustomEdges/CustomEdge';
import type { IPipeline, IPipelineConfig } from '../pipeline.types';
import { toPipelineConfig } from '../PipelineFlow.utils';
import { BuilderHeader, SaveChangesButton } from './BuilderHeader';
import { CreateBlockFloatingMenu } from './CreateBlock/CreateBlockFloatingMenu';
import { FloatingChat } from './FloatingChatInterface/FloatingChat';
import type { loader } from './loader.server';

export function PipelineBuilder() {
  const updateFetcher = useFetcher<IPipeline>();
  const [searchParams] = useSearchParams();
  const { pipeline, pipelineId, organizationId, aliasId, pageUrl } =
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

  const {
    value: isFloatingChatOpen,
    toggle: toggleFloatingChat,
    setFalse: closeFloatingChat,
  } = useBoolean(false);

  const handleCloseSidebar = (value: boolean) => {
    if (value) return;
    navigate(
      routes.pipelineBuild(
        organizationId,
        pipelineId,
        Object.fromEntries(searchParams.entries()),
      ),
    );
  };

  const isDisabled = aliasId !== 'latest';

  const key = JSON.stringify(pipeline);

  if (isDisabled) {
    return (
      <Builder
        alias={aliasId}
        key="flow-readOnly"
        type="readOnly"
        className="h-[calc(100vh_-_64px)] pt-0"
        pipeline={pipeline}
        CustomNodes={{ custom: AliasCustomNode, comment: ReadonlyCommentNode }}
        CustomEdges={{ default: CustomEdge }}
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
        CustomNodes={{ custom: BuilderCustomNode, comment: BuilderCommentNode }}
        CustomEdges={{ default: CustomEdge }}
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

            <FloatingChat
              key={key}
              isOpen={isFloatingChatOpen}
              toggle={toggleFloatingChat}
              close={closeFloatingChat}
              webchatConfig={pipeline.interface_config.webchat}
              chatUrl={`${pageUrl}/webchats/${organizationId}/pipelines/${pipelineId}?alias=latest`}
            />
          </>
        )}
      </Builder>

      <DialogDrawer open={isSidebarOpen} onOpenChange={handleCloseSidebar}>
        <DialogDrawerContent className="md:max-w-[700px] md:w-[600px] lg:w-[700px]">
          <Outlet />
        </DialogDrawerContent>
      </DialogDrawer>
    </>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Build',
    },
  ];
});
