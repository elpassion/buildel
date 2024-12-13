import React, { useEffect, useMemo, useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { useStore } from '@xyflow/react';
import { ClientOnly } from 'remix-utils/client-only';
import { useLocalStorage } from 'usehooks-ts';

import { EmptyMessage, ItemList } from '~/components/list/ItemList';
import { PinButton } from '~/components/pages/pipelines/build/BuilderSidebar/BuilderSidebar';
import { RunLogs } from '~/components/pages/pipelines/components/RunLogs';
import {
  Log,
  LogBlockName,
  LogDate,
  LogMessage,
  LogsLoadMoreWrapper,
  LogsWrapper,
  LogTopic,
  LogTypes,
  RunLogsFilter,
} from '~/components/pages/pipelines/components/RunLogs.components';
import { IExtendedPipeline } from '~/components/pages/pipelines/pipeline.types';
import { loader as logsLoader } from '~/components/pages/pipelines/runLogs/loader.server';
import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';
import { LoadMoreButton } from '~/components/pagination/LoadMoreButton';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { cn } from '~/utils/cn';
import { routes } from '~/utils/routes.utils';
import { hashString } from '~/utils/stringHash';

import {
  BuilderSidebarContext,
  BuilderSidebarState,
  useBuilderSidebar,
} from './BuilderSidebar.context';
import { useResizeElement } from './useResizeElement';

interface BuilderBottomSidebarProps {
  pipeline: IExtendedPipeline;
}

// Bypass for getting rid of the hydration error when using the LS
export const BuilderBottomSidebar = (props: BuilderBottomSidebarProps) => {
  return (
    <ClientOnly fallback={null}>
      {() => <BuilderBottomSidebarClient {...props} />}
    </ClientOnly>
  );
};

const BuilderBottomSidebarClient = ({
  pipeline,
}: BuilderBottomSidebarProps) => {
  const [blockName, setBlockName] = useState<string | null>(null);
  const organizationId = useOrganizationId();
  const { isDesktop } = useBreakpoints();
  const { ref, onMousedown } = useResizeElement<HTMLDivElement>();
  const { runId } = useRunPipeline();
  const [state, setState] = useLocalStorage<BuilderSidebarState>(
    buildLSKey(organizationId),
    'closed',
  );

  const onMouseOver = () => {
    if (state === 'keepOpen') return;
    if (isDesktop) setState('open');
    else {
      setState('keepOpen');
    }
  };

  const onMouseLeave = () => {
    if (state === 'keepOpen') return;
    setState('closed');
  };

  const onPinClick = () => {
    if (state === 'keepOpen') {
      setState('open');
    } else {
      setState('keepOpen');
    }
  };

  const onBlockSelect = (blockName: string) => {
    setBlockName(blockName);
  };

  const onClear = () => {
    setBlockName(null);
  };

  const options = useMemo(() => {
    return pipeline.config.blocks.map((block) => ({
      value: block.name,
      label: block.name,
    }));
  }, [pipeline.config.blocks]);

  const onClose = () => {
    setState('closed');
  };

  const isOpen = state === 'open' || state === 'keepOpen';

  return (
    <BuilderSidebarContext.Provider
      value={{ isOpen, state, onPinClick, onClose }}
    >
      <div
        id="builder-bottom-sidebar"
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
        data-state={isOpen ? 'open' : 'close'}
        className="relative"
      >
        <HoverableBottomLine />

        <div
          ref={ref}
          className={cn(
            'resize-y fixed translate-y-full bottom-0 left-0 z-[50] w-full h-[200px] min-h-[200px] max-h-[50vh] border-t border-input bg-white transition-transform ease-in-out',
            {
              'translate-y-full': !isOpen,
              'translate-y-0': isOpen,
            },
          )}
        >
          <div
            className="absolute -top-2.5 left-0 right-0 bg-transparent py-2 group cursor-row-resize"
            onMouseDown={onMousedown}
          >
            <div className="w-full h-[2px] bg-transparent group-hover:bg-blue-500" />
          </div>

          <header className="flex gap-2 justify-between items-center border-b border-input px-2 py-1">
            <div className="flex gap-4 items-center">
              <h4 className="text-xs">Logs</h4>
              <RunLogsFilter
                value={blockName}
                onSelect={onBlockSelect}
                onClear={onClear}
                options={options}
                className="select-sm"
              />
            </div>
            <PinButton />
          </header>

          {isOpen && (
            <SidebarLogs
              key={runId}
              pipeline={pipeline}
              blockName={blockName ?? undefined}
            />
          )}
        </div>
      </div>
    </BuilderSidebarContext.Provider>
  );
};

function HoverableBottomLine() {
  const { isOpen } = useBuilderSidebar();

  return (
    <div className="h-5 w-full absolute bottom-0 left-0 z-[11] flex justify-center items-center">
      <div
        className={cn(
          'h-2 w-6 bg-primary rounded-full transition-opacity delay-300',
          {
            'opacity-0': isOpen,
            'opacity-20': !isOpen,
          },
        )}
      />
    </div>
  );
}

function SidebarLogs({
  pipeline,
  blockName,
}: BuilderBottomSidebarProps & { blockName?: string }) {
  const { status, runId } = useRunPipeline();
  const isStarting = status === 'starting';
  const isIdle = status === 'idle';
  const fetcher = useFetcher<typeof logsLoader>();
  const [key, setKey] = useState(Date.now());

  const selectedNode = useStore((state) =>
    state.nodes.find((node) => node.selected),
  );

  useEffect(() => {
    if (runId) {
      fetcher.load(
        routes.pipelineRunLogs(pipeline.organization_id, pipeline.id, runId, {
          block_name: blockName,
        }),
      );
    }
  }, [status, blockName]);

  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle') {
      setKey(Date.now());
    }
  }, [fetcher.state, blockName]);

  const clearActiveLogs = () => {
    const rows = [
      ...document.querySelectorAll(`[data-logactive="true"]`),
    ] as HTMLDivElement[];

    rows.forEach((row) => {
      row.removeAttribute('data-logactive');
    });
  };

  const setActiveLogs = (id: string) => {
    const rows = [
      ...document.querySelectorAll(`[data-log="${buildLogRowKey(id)}"]`),
    ] as HTMLDivElement[];

    rows.forEach((row) => {
      row.setAttribute('data-logactive', 'true');
    });
  };

  useEffect(() => {
    if (selectedNode) {
      clearActiveLogs();
      setActiveLogs(selectedNode.id);
    } else {
      clearActiveLogs();
    }
  }, [selectedNode?.id]);

  if (isStarting) {
    return (
      <EmptyMessage className="text-xs mx-auto block w-fit mt-4">
        Starting...
      </EmptyMessage>
    );
  }

  if (isIdle || !runId) {
    return (
      <EmptyMessage className="text-xs mx-auto block w-fit mt-4">
        Workflow is not running...
      </EmptyMessage>
    );
  }

  return (
    <RunLogs
      key={key}
      blockName={blockName}
      runId={Number(runId)}
      pipelineId={pipeline.id}
      organizationId={pipeline.organization_id}
      defaultLogs={fetcher.data?.logs ?? []}
      defaultAfter={fetcher.data?.pagination.after}
      renderLogs={(logs, { status, fetchNext, fetchNextRef, after }) => (
        <LogsWrapper
          size="sm"
          variant="light"
          className="w-full max-h-[calc(100%_-_45px)] px-2"
        >
          <ItemList
            items={logs}
            renderItem={(log) => (
              <Log
                log={log}
                className={cn(
                  'py-1 data-[logactive=true]:bg-primary/5 data-[logactive=true]:hover:bg-muted',
                )}
                data-log={buildLogRowKey(log.block_name)}
              >
                <LogDate className="mr-2">{log.created_at}</LogDate>
                <LogTopic className="mr-2">{log.context}</LogTopic>
                <LogBlockName className="mr-2">{log.block_name}</LogBlockName>
                <LogMessage className="mr-2" log={log}>
                  {log.message}
                </LogMessage>
                <LogTypes>{log.message_types?.join(' -> ')}</LogTypes>
              </Log>
            )}
          />

          <LogsLoadMoreWrapper ref={fetchNextRef}>
            <LoadMoreButton
              className="text-xs"
              isFetching={status !== 'idle'}
              disabled={status !== 'idle'}
              hasNextPage={!!after}
              onClick={fetchNext}
            />
          </LogsLoadMoreWrapper>
        </LogsWrapper>
      )}
    />
  );
}

function buildLSKey(organizationId: string) {
  return hashString('builder-bottom-sidebar-' + organizationId).toString();
}

function buildLogRowKey(blockName: string) {
  return `${blockName}-log-row`;
}
