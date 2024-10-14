import React, { useCallback, useEffect, useState } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useFetcher, useLoaderData } from '@remix-run/react';
import isEqual from 'lodash.isequal';
import { useBoolean } from 'usehooks-ts';

import { BuilderSidebar } from '~/components/pages/pipelines/build/BuilderSidebar/BuilderSidebar';
import { FloatingBoard } from '~/components/pages/pipelines/build/FloatingInterfaces/FloatingBoard';
import { FloatingDynamicWrapper } from '~/components/pages/pipelines/build/FloatingInterfaces/FloatingContentWrapper';
import { RunLogs } from '~/components/pages/pipelines/components/RunLogs';
import { BuilderCommentNode } from '~/components/pages/pipelines/Nodes/CommentNodes/BuilderCommentNode';
import { ReadonlyCommentNode } from '~/components/pages/pipelines/Nodes/CommentNodes/ReadonlyCommentNode';
import { AliasCustomNode } from '~/components/pages/pipelines/Nodes/CustomNodes/AliasCustomNode';
import { BuilderCustomNode } from '~/components/pages/pipelines/Nodes/CustomNodes/BuilderCustomNode';
import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import { Builder } from '../Builder';
import { CustomEdge } from '../Edges/CustomEdges/CustomEdge';
import type { IPipeline, IPipelineConfig } from '../pipeline.types';
import { IExtendedPipeline } from '../pipeline.types';
import { toPipelineConfig } from '../PipelineFlow.utils';
import type { loader as logsLoader } from '../runLogs/loader.server';
import { BuilderHeader, SaveChangesButton } from './BuilderHeader';
import {
  FloatingChat,
  FloatingChatButton,
} from './FloatingInterfaces/FloatingChat';
import { FloatingLogsButton } from './FloatingInterfaces/FloatingLogs';
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

            <FloatingBoard>
              <BuilderFloatingChat pipeline={pipeline} pageUrl={pageUrl} />
              <BuilderFloatingLogs pipeline={pipeline} />
            </FloatingBoard>
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

interface BuilderFloatingLogsProps {
  pipeline: IExtendedPipeline;
}

function BuilderFloatingLogs({ pipeline }: BuilderFloatingLogsProps) {
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
      <FloatingLogsButton
        className="absolute bottom-[185px] right-[15px] pointer-events-auto"
        onClick={toggle}
      />

      {isOpen ? (
        <FloatingDynamicWrapper
          suffix="logs"
          defaultPosition={{ right: 16, bottom: 32 }}
          onClose={close}
        >
          <FloatingLogsContent pipeline={pipeline} />
        </FloatingDynamicWrapper>
      ) : null}
    </>
  );
}

function FloatingLogsContent({ pipeline }: BuilderFloatingLogsProps) {
  const { status, runId } = useRunPipeline();

  const isStarting = status === 'starting';
  const isIdle = status === 'idle';
  const fetcher = useFetcher<typeof logsLoader>();
  const [key, setKey] = useState(Date.now());

  useEffect(() => {
    if (runId && !fetcher.data) {
      fetcher.load(
        routes.pipelineRunLogs(pipeline.organization_id, pipeline.id, runId),
      );
    }
  }, [status]);

  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle') {
      setKey(Date.now());
    }
  }, [fetcher.state]);

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

  return (
    <RunLogs
      key={key}
      defaultLogs={fetcher.data?.logs ?? []}
      defaultAfter={fetcher.data?.pagination.after}
      runId={Number(runId)}
      pipelineId={pipeline.id}
      organizationId={pipeline.organization_id}
      className="max-w-[950px] min-w-[950px] max-h-[400px]"
    />
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
