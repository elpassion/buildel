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
import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';
import { metaWithDefaults } from '~/utils/metadata';

import { Builder } from '../Builder';
import { CustomEdge } from '../Edges/CustomEdges/CustomEdge';
import type { IPipeline, IPipelineConfig } from '../pipeline.types';
import { IExtendedPipeline } from '../pipeline.types';
import { toPipelineConfig } from '../PipelineFlow.utils';
import { BuilderHeader, SaveChangesButton } from './BuilderHeader';
import {
  FloatingChat,
  FloatingChatButton,
  FloatingChatWrapper,
} from './FloatingChatInterface/FloatingChat';
import type { loader } from './loader.server';

export function PipelineBuilder() {
  const updateFetcher = useFetcher<IPipeline>();
  const { pipeline, aliasId, pageUrl, organization, elPipeline } =
    useLoaderData<typeof loader>();

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

  const isDisabled = aliasId !== 'latest';

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

            <BuilderFloatingChat pipeline={pipeline} pageUrl={pageUrl} />
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

interface BuilderFloatingChatProps {
  pipeline: IExtendedPipeline;
  pageUrl: string;
}

function BuilderFloatingChat({ pipeline, pageUrl }: BuilderFloatingChatProps) {
  const { status, startRun } = useRunPipeline();

  const {
    value: isOpen,
    setFalse: closeFloatingChat,
    setTrue: openFloatingChat,
  } = useBoolean(false);

  const toggle = () => {
    if (!isOpen) {
      if (status === 'idle') {
        startRun();
      }

      openFloatingChat();
    } else {
      closeFloatingChat();
    }
  };

  return (
    <div className="hidden fixed z-[51] top-0 bottom-0 left-0 right-0 pointer-events-none lg:block">
      <FloatingChatButton
        className="absolute bottom-4 right-4 pointer-events-auto"
        onClick={toggle}
      />

      {isOpen ? (
        <FloatingChatWrapper onClose={closeFloatingChat}>
          <FloatingChatContent pipeline={pipeline} baseUrl={pageUrl} />
        </FloatingChatWrapper>
      ) : null}
    </div>
  );
}

interface FloatingChatContentProps {
  baseUrl: string;
  pipeline: IExtendedPipeline;
}

function FloatingChatContent({ baseUrl, pipeline }: FloatingChatContentProps) {
  const { status, runId } = useRunPipeline();

  const isStarting = status === 'starting';
  const isIdle = status === 'idle';

  if (isStarting) {
    return <span className="text-xs text-muted-foreground">Starting...</span>;
  }

  if (isIdle || !runId) {
    return (
      <span className="text-xs text-muted-foreground">
        Workflow is not running...
      </span>
    );
  }

  const chatUrl = `${baseUrl}/webchats/${pipeline.organization_id}/pipelines/${pipeline.id}/${runId}?alias=latest&size=sm`;

  return (
    <FloatingChat
      chatUrl={chatUrl}
      config={pipeline.interface_config.webchat}
    />
  );
}
