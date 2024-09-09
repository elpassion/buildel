import React, { useCallback } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useFetcher, useLoaderData } from '@remix-run/react';
import isEqual from 'lodash.isequal';
import { useBoolean } from 'usehooks-ts';

import { BuilderSidebar } from '~/components/pages/pipelines/build/BuilderSidebar/BuilderSidebar';
import { BuilderCommentNode } from '~/components/pages/pipelines/Nodes/CommentNodes/BuilderCommentNode';
import { ReadonlyCommentNode } from '~/components/pages/pipelines/Nodes/CommentNodes/ReadonlyCommentNode';
import { AliasCustomNode } from '~/components/pages/pipelines/Nodes/CustomNodes/AliasCustomNode';
import { BuilderCustomNode } from '~/components/pages/pipelines/Nodes/CustomNodes/BuilderCustomNode';
import { metaWithDefaults } from '~/utils/metadata';

import { Builder } from '../Builder';
import { CustomEdge } from '../Edges/CustomEdges/CustomEdge';
import type { IPipeline, IPipelineConfig } from '../pipeline.types';
import { toPipelineConfig } from '../PipelineFlow.utils';
import { BuilderHeader, SaveChangesButton } from './BuilderHeader';
import { FloatingChat } from './FloatingChatInterface/FloatingChat';
import type { loader } from './loader.server';

export function PipelineBuilder() {
  const updateFetcher = useFetcher<IPipeline>();
  const {
    pipeline,
    pipelineId,
    organizationId,
    aliasId,
    pageUrl,
    organization,
    elPipeline,
  } = useLoaderData<typeof loader>();

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
        {() => <BuilderHeader organization={organization} />}
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
        sidebar={BuilderSidebar}
      >
        {({ edges, nodes, onBlockCreate }) => (
          <>
            <BuilderHeader organization={organization} elPipeline={elPipeline}>
              <SaveChangesButton
                config={toPipelineConfig(nodes, edges)}
                isSaving={updateFetcher.state !== 'idle'}
                onSave={handleUpdatePipeline}
              />
            </BuilderHeader>

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

      <Outlet />
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
