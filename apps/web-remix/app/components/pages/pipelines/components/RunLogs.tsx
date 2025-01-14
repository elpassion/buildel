import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useInView } from 'react-intersection-observer';
import { useFetcher } from '@remix-run/react';

import type { IPipelineRunLog } from '~/api/pipeline/pipeline.contracts';
import type { loader } from '~/components/pages/pipelines/runLogs/loader.server';
import { usePipelineRunLogs } from '~/components/pages/pipelines/usePipelineRunLogs';
import { routes } from '~/utils/routes.utils';
import { buildUrlWithParams } from '~/utils/url';

import { fetchOlder, log, runLogsReducer } from './runLogs.reducer';

interface RunLogsProps {
  defaultLogs: IPipelineRunLog[];
  defaultAfter?: string | null;
  blockName?: string;
  runId: number;
  pipelineId: number;
  organizationId: number;
  renderLogs: (
    logs: IPipelineRunLog[],
    args: {
      status: ReturnType<typeof useFetcher>['state'];
      fetchNext: () => void;
      fetchNextRef: any;
      after: string | null;
    },
  ) => React.ReactNode;
}

export function RunLogs({
  defaultLogs,
  defaultAfter,
  blockName,
  pipelineId,
  organizationId,
  runId,
  renderLogs,
}: RunLogsProps) {
  const { ref: fetchNextRef, inView } = useInView();

  const { fetchNext, logs, after, status } = useInfiniteRunLogs({
    blockName,
    organizationId,
    pipelineId,
    runId,
    defaultLogs,
    defaultAfter,
  });

  useEffect(() => {
    if (inView && after && status === 'idle') {
      fetchNext();
    }
  }, [inView, after]);

  return <>{renderLogs(logs, { status, fetchNext, fetchNextRef, after })}</>;
}

export interface UseInfiniteRunLogsArgs {
  defaultLogs?: IPipelineRunLog[];
  defaultAfter?: string | null;
  blockName?: string;
  runId: number;
  pipelineId: number;
  organizationId: number;
}

export function useInfiniteRunLogs({
  blockName,
  defaultLogs,
  defaultAfter,
  organizationId,
  pipelineId,
  runId,
}: UseInfiniteRunLogsArgs) {
  const fetcher = useFetcher<typeof loader>();

  const [state, dispatch] = useReducer(runLogsReducer, {
    after: defaultAfter ?? null,
    logs: (defaultLogs || []).slice().reverse(),
  });

  const onLogs = useCallback((payload: any) => {
    dispatch(log(payload.data));
  }, []);

  const onError = useCallback((error: string) => {
    console.error(error);
  }, []);

  const { status, listenToLogs } = usePipelineRunLogs(
    organizationId,
    pipelineId,
    runId,
    () => {},
    onLogs,
    onError,
  );

  const fetchNextPage = useCallback(() => {
    fetcher.load(
      buildUrlWithParams(
        routes.pipelineRunLogs(organizationId, pipelineId, runId),
        {
          after: state.after ?? undefined,
          block_name: blockName,
        },
      ),
    );
  }, [state.after, blockName]);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      dispatch(fetchOlder(fetcher.data.logs, fetcher.data.pagination.after));
    }
  }, [fetcher.state]);

  useEffect(() => {
    if (status === 'open') {
      listenToLogs({
        block_name: blockName,
      });
    }
  }, [status]);

  return useMemo(
    () => ({
      fetchNext: fetchNextPage,
      logs: state.logs.slice(),
      after: state.after,
      status: fetcher.state,
    }),
    [fetchNextPage, state.logs, state.after, fetcher.state],
  );
}
