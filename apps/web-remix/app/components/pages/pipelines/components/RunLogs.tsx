import { useEffect, useReducer } from 'react';
import { useInView } from 'react-intersection-observer';
import { useFetcher } from '@remix-run/react';

import type { IPipelineRunLog } from '~/api/pipeline/pipeline.contracts';
import { SelectInput } from '~/components/form/inputs/select/select.input';
import type { loader } from '~/components/pages/pipelines/runLogs/loader.server';
import {
  fetchOlder,
  log,
  runLogsReducer,
} from '~/components/pages/pipelines/runLogs/runLogs.reducer';
import { usePipelineRunLogs } from '~/components/pages/pipelines/usePipelineRunLogs';
import { LoadMoreButton } from '~/components/pagination/LoadMoreButton';
import { routes } from '~/utils/routes.utils';
import { buildUrlWithParams } from '~/utils/url';

interface LogsProps {
  defaultLogs: IPipelineRunLog[];
  defaultAfter?: string | null;
  blockName?: string;
  runId: number;
  pipelineId: number;
  organizationId: number;
}

export function RunLogs({
  defaultLogs,
  defaultAfter,
  blockName,
  pipelineId,
  organizationId,
  runId,
}: LogsProps) {
  const fetcher = useFetcher<typeof loader>();
  const { ref: fetchNextRef, inView } = useInView();

  const [state, dispatch] = useReducer(runLogsReducer, {
    after: defaultAfter ?? null,
    logs: defaultLogs.slice().reverse(),
  });

  const onLogs = (payload: any) => {
    dispatch(log(payload.data));
  };

  const onError = (error: string) => {
    console.error(error);
  };

  const { status, listenToLogs, stopListening } = usePipelineRunLogs(
    organizationId,
    pipelineId,
    runId,
    () => {},
    onLogs,
    onError,
  );

  const fetchNextPage = () => {
    fetcher.load(
      buildUrlWithParams(
        routes.pipelineRunLogs(organizationId, pipelineId, runId),
        {
          after: state.after ?? undefined,
          block_name: blockName,
        },
      ),
    );
  };

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      dispatch(fetchOlder(fetcher.data.logs, fetcher.data.pagination.after));
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (inView && state.after && fetcher.state === 'idle') {
      fetchNextPage();
    }
  }, [inView, state.after]);

  useEffect(() => {
    if (status === 'open') {
      listenToLogs({
        block_name: blockName,
      });
    }

    return () => {
      stopListening();
    };
  }, [status]);

  return (
    <div className="mt-2 bg-gray-800 text-gray-400 font-mono p-4 h-[65vh] max-h-[450px] overflow-y-auto rounded-lg flex flex-col-reverse">
      <ul className="flex flex-col-reverse">
        {state.logs
          .map((log) => (
            <li key={log.id}>
              <Log log={log} />
            </li>
          ))
          .slice()
          .reverse()}
      </ul>

      <div className="flex justify-center mt-5" ref={fetchNextRef}>
        <LoadMoreButton
          isFetching={fetcher.state !== 'idle'}
          disabled={fetcher.state !== 'idle'}
          hasNextPage={!!state.after}
          onClick={fetchNextPage}
        />
      </div>
    </div>
  );
}

interface LogsFilterProps {
  value: string | null | undefined;
  onSelect: (blockName: string) => void;
  onClear: () => void;
  options: { value: string; label: string }[];
}

export function RunLogsFilter({
  value,
  onClear,
  onSelect,
  options,
}: LogsFilterProps) {
  return (
    <SelectInput
      allowClear
      onClear={onClear}
      placeholder="Select block..."
      value={value}
      onSelect={onSelect}
      options={options}
    />
  );
}

const Log = ({ log }: { log: any }) => {
  return (
    <p className="mb-2">
      <span className="text-cyan-400 mr-2">{log?.created_at}</span>
      <span className="text-yellow-500 mr-2">{log?.context}</span>
      <span className="text-purple-500 mr-2">{log?.block_name}</span>
      <span className="text-gray-300 mr-2">{log?.message}</span>
      <span className="text-green-300">{log?.message_types?.join(' -> ')}</span>
    </p>
  );
};
