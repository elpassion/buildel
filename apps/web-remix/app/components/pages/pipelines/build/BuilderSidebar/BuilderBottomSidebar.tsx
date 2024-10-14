import React, { useEffect, useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { useLocalStorage } from 'usehooks-ts';

import { EmptyMessage } from '~/components/list/ItemList';
import { PinButton } from '~/components/pages/pipelines/build/BuilderSidebar/BuilderSidebar';
import { RunLogs } from '~/components/pages/pipelines/components/RunLogs';
import { IExtendedPipeline } from '~/components/pages/pipelines/pipeline.types';
import { loader as logsLoader } from '~/components/pages/pipelines/runLogs/loader.server';
import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';
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
  const organizationId = useOrganizationId();
  const { isDesktop } = useBreakpoints();

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

  const onClose = () => {
    setState('closed');
  };

  const isOpen = state === 'open' || state === 'keepOpen';

  return (
    <BuilderSidebarContext.Provider
      value={{ isOpen, state, onPinClick, onClose }}
    >
      <div onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
        <HoverableBottomLine />

        <div
          className={cn(
            'fixed translate-y-full bottom-0 left-0 z-[52] w-full h-[200px] border-t border-input bg-white transition-transform ease-in-out',
            {
              'translate-y-full': !isOpen,
              'translate-y-0': isOpen,
            },
          )}
        >
          <header className="flex gap-2 justify-between items-center border-b border-input px-2 py-1">
            <h4 className="text-xs">Logs</h4>
            <PinButton />
          </header>

          {isOpen && <SidebarLogs pipeline={pipeline} />}
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

function SidebarLogs({ pipeline }: BuilderBottomSidebarProps) {
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
      defaultLogs={fetcher.data?.logs ?? []}
      defaultAfter={fetcher.data?.pagination.after}
      runId={Number(runId)}
      pipelineId={pipeline.id}
      organizationId={pipeline.organization_id}
      className="w-full max-h-[calc(100%_-_45px)] px-2"
      variant="light"
      size="sm"
    />
  );
}

function buildLSKey(organizationId: string) {
  return hashString('builder-bottom-sidebar-' + organizationId).toString();
}
