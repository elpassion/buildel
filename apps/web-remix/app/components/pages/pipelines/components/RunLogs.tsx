import { useEffect, useReducer } from 'react';
import { useInView } from 'react-intersection-observer';
import { useFetcher } from '@remix-run/react';

import type { IPipelineRunLog } from '~/api/pipeline/pipeline.contracts';
import { SelectInput } from '~/components/form/inputs/select/select.input';
import { SelectInputProps } from '~/components/form/inputs/select/select.input-impl.client';
import { BasicLink } from '~/components/link/BasicLink';
import { EmptyMessage } from '~/components/list/ItemList';
import type { loader } from '~/components/pages/pipelines/runLogs/loader.server';
import { usePipelineRunLogs } from '~/components/pages/pipelines/usePipelineRunLogs';
import { LoadMoreButton } from '~/components/pagination/LoadMoreButton';
import { cn } from '~/utils/cn';
import { routes } from '~/utils/routes.utils';
import { buildUrlWithParams } from '~/utils/url';

import { fetchOlder, log, runLogsReducer } from './runLogs.reducer';

export type LogsVariant = 'dark' | 'light';
export type LogsSize = 'sm' | 'md';

interface LogsProps {
  defaultLogs: IPipelineRunLog[];
  defaultAfter?: string | null;
  blockName?: string;
  runId: number;
  pipelineId: number;
  organizationId: number;
  className?: string;
  variant?: LogsVariant;
  size?: LogsSize;
}

export function RunLogs({
  defaultLogs,
  defaultAfter,
  blockName,
  pipelineId,
  organizationId,
  runId,
  className,
  variant = 'dark',
  size = 'md',
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

  const { status, listenToLogs } = usePipelineRunLogs(
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
  }, [fetcher.state]);

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
  }, [status]);

  return (
    <div
      className={cn(
        'p-4 h-[65vh] max-h-[450px] overflow-y-auto rounded-lg flex flex-col-reverse',
        {
          'bg-gray-800 text-gray-400': variant === 'dark',
          'bg-[#fbfbfb] text-foreground': variant === 'light',
        },
        className,
      )}
    >
      <ul className="flex flex-col-reverse">
        {state.logs
          .map((log) => (
            <li key={log.id}>
              <Log log={log} variant={variant} size={size} />
            </li>
          ))
          .slice()
          .reverse()}
      </ul>

      <div className="flex justify-center" ref={fetchNextRef}>
        <LoadMoreButton
          isFetching={fetcher.state !== 'idle'}
          disabled={fetcher.state !== 'idle'}
          hasNextPage={!!state.after}
          onClick={fetchNextPage}
          className={cn({ 'text-xs': size === 'sm' })}
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
  ...rest
}: LogsFilterProps & Partial<SelectInputProps>) {
  return (
    <SelectInput
      allowClear
      onClear={onClear}
      placeholder="Filter by block..."
      value={value}
      onSelect={onSelect}
      options={options}
      {...rest}
    />
  );
}

const Log = ({
  log,
  variant,
  size,
}: {
  log: any;
  variant: LogsVariant;
  size: LogsSize;
}) => {
  const isError = log?.message_types?.includes('error');

  return (
    <p
      className={cn({
        'mb-2': size === 'md',
        'hover:bg-muted': variant === 'light',
        'hover:bg-gray-700': variant === 'dark',
      })}
    >
      <span
        className={cn('text-cyan-400 mr-2 whitespace-nowrap', getLogSize(size))}
      >
        {log?.created_at}
      </span>
      <span className={cn('text-yellow-500 mr-2', getLogSize(size))}>
        {log?.context}
      </span>
      <span className={cn('text-purple-500 mr-2', getLogSize(size))}>
        {log?.block_name}
      </span>
      <span
        className={cn(
          'mr-2',
          {
            'text-red-500': isError,
            'text-gray-300': !isError && variant === 'dark',
            'text-muted-foreground': !isError && variant === 'light',
          },
          getLogSize(size),
        )}
      >
        {log?.message}
      </span>
      <span className={cn('text-green-400', getLogSize(size))}>
        {log?.message_types?.join(' -> ')}
      </span>
    </p>
  );
};

function getLogSize(size: LogsSize) {
  switch (size) {
    case 'sm':
      return 'text-xs';
    case 'md':
      return 'text-base';
  }
}

interface LogsEmptyMessageProps {
  organizationId: number;
  pipelineId: number;
  className?: string;
}
export function LogsEmptyMessage({
  organizationId,
  className,
  pipelineId,
}: LogsEmptyMessageProps) {
  return (
    <EmptyMessage
      className={cn('block mx-auto text-center w-fit max-w-[350px]', className)}
    >
      No logs found for this run. You can enable logs in the workflow{' '}
      <BasicLink
        target="_blank"
        className="font-semibold text-foreground hover:underline"
        to={routes.pipelineSettings(organizationId, pipelineId)}
      >
        settings
      </BasicLink>
      .
    </EmptyMessage>
  );
}
