import React, { useCallback } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useFetcher, useLoaderData } from '@remix-run/react';
import isEqual from 'lodash.isequal';
import { useBoolean } from 'usehooks-ts';

import { BuilderBottomSidebar } from '~/components/pages/pipelines/build/BuilderSidebar/BuilderBottomSidebar';
import { BuilderSidebar } from '~/components/pages/pipelines/build/BuilderSidebar/BuilderSidebar';
import { FloatingBoard } from '~/components/pages/pipelines/build/FloatingInterfaces/FloatingBoard';
import { FloatingDynamicWrapper } from '~/components/pages/pipelines/build/FloatingInterfaces/FloatingContentWrapper';
import { BuilderCommentNode } from '~/components/pages/pipelines/Nodes/CommentNodes/BuilderCommentNode';
import { ReadonlyCommentNode } from '~/components/pages/pipelines/Nodes/CommentNodes/ReadonlyCommentNode';
import { AliasCustomNode } from '~/components/pages/pipelines/Nodes/CustomNodes/AliasCustomNode';
import { BuilderCustomNode } from '~/components/pages/pipelines/Nodes/CustomNodes/BuilderCustomNode';
import { BuilderVideoNode } from '~/components/pages/pipelines/Nodes/VideoNodes/BuilderVideoNode';
import { ReadonlyVideoNode } from '~/components/pages/pipelines/Nodes/VideoNodes/ReadonlyVideoNode';
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
} from './FloatingInterfaces/FloatingChat';
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
        CustomNodes={{
          custom: AliasCustomNode,
          comment: ReadonlyCommentNode,
          video: ReadonlyVideoNode,
        }}
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
        CustomNodes={{
          custom: BuilderCustomNode,
          comment: BuilderCommentNode,
          video: BuilderVideoNode,
        }}
        CustomEdges={{ default: CustomEdge }}
        className="h-[calc(100vh_-_64px)] pt-0"
        sidebar={BuilderSidebar}
      >
        {({ edges, nodes }) => (
          <>
            <BuilderHeader organization={organization} elPipeline={elPipeline}>
              <SaveChangesButton
                config={toPipelineConfig(nodes, edges)}
                isSaving={updateFetcher.state !== 'idle'}
                onSave={handleUpdatePipeline}
              />
            </BuilderHeader>

            <FloatingBoard>
              <BuilderFloatingChat pipeline={pipeline} pageUrl={pageUrl} />
            </FloatingBoard>

            <BuilderBottomSidebar pipeline={pipeline} />
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

  const { value: isOpen, setFalse: close, setTrue: open } = useBoolean(false);

  const toggle = () => {
    if (!isOpen) {
      if (status === 'idle') {
        startRun();
      }

      open();
    } else {
      close();
    }
  };
  return (
    <>
      <FloatingChatButton
        id="builder-floating-chat-btn"
        className="absolute bottom-[152px] right-[15px] pointer-events-auto"
        onClick={toggle}
      />

      {isOpen ? (
        <FloatingDynamicWrapper onClose={close}>
          <FloatingChatContent pipeline={pipeline} baseUrl={pageUrl} />
        </FloatingDynamicWrapper>
      ) : null}
    </>
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
