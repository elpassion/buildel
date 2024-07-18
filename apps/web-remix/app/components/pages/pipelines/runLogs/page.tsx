import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import type { MetaFunction } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';

import type { IPipelineRunLog } from '~/api/pipeline/pipeline.contracts';
import { SelectInput } from '~/components/form/inputs/select/select.input';
import { LoadMoreButton } from '~/components/pagination/LoadMoreButton';
import { Label } from '~/components/ui/label';
import { routes } from '~/utils/routes.utils';
import { buildUrlWithParams } from '~/utils/url';

import { usePipelineRunLogs } from '../usePipelineRunLogs';
import type { loader } from './loader.server';

export function PipelineRunLogs() {
  const fetcher = useFetcher();
  const { ref: fetchNextRef, inView } = useInView();
  const { pipeline, pipelineRun, pipelineRunLogs, blockName } =
    useLoaderData<typeof loader>();
  const [liveLogs, setLiveLogs] = useState<any[]>([]);
  const [data, setData] = useState<IPipelineRunLog[]>(pipelineRunLogs.data);
  const [after, setAfter] = useState<string | null | undefined>(
    pipelineRunLogs.meta.after,
  );
  const [selectedBlock, setSelectedBlock] = useState<string | null | undefined>(
    blockName,
  );

  const { status, listenToLogs, stopListening } = usePipelineRunLogs(
    pipeline.organization_id,
    pipeline.id,
    pipelineRun.id,
    () => {},
    (payload) => {
      setLiveLogs((prev) => [...prev, payload.data]);
    },
    (error) => console.error(error),
  );

  const fetchNextPage = () => {
    if (fetcher.state !== 'idle') return;

    const urlWithParams = buildUrlWithParams(
      routes.pipelineRunLogs(
        pipeline.organization_id,
        pipeline.id,
        pipelineRun.id,
      ),
      {
        after: after ?? undefined,
        block_name: selectedBlock ?? undefined,
      },
    );

    fetcher.load(urlWithParams);
  };

  useEffect(() => {
    const newData = (fetcher.data as any)?.pipelineRunLogs;

    if (newData) {
      setAfter(newData.meta.after);
      if (newData.data.length > 0) {
        setData((prev) => [...prev, ...newData.data]);
      }
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (inView && after) {
      fetchNextPage();
    }
  }, [inView, after]);

  useEffect(() => {
    if (status === 'open') {
      listenToLogs({
        block_name: blockName,
      });
    }
  }, [status]);

  return (
    <div className="mt-2">
      <Label>Filter by block</Label>
      <SelectInput
        placeholder="Select..."
        options={pipelineRun.config.blocks.map((block) => ({
          id: block.name,
          value: block.name,
          label: block.name,
        }))}
        onSelect={(selected: any) => {
          const urlWithParams = buildUrlWithParams(
            routes.pipelineRunLogs(
              pipeline.organization_id,
              pipeline.id,
              pipelineRun.id,
            ),
            {
              block_name: selected?.value ?? undefined,
            },
          );

          stopListening().then(() =>
            listenToLogs({
              block_name: selected?.value ?? undefined,
            }),
          );
          setLiveLogs([]);
          setData([]);
          setSelectedBlock(selected?.value);

          fetcher.load(urlWithParams);
        }}
      />

      <div className="mt-2 bg-gray-800 text-gray-400 font-mono p-4 h-96 overflow-y-auto rounded-lg flex flex-col-reverse">
        \{liveLogs.map((log) => <Log key={log.id} log={log} />).reverse()}
        {data.map((log) => (
          <Log key={log.id} log={log} />
        ))}
        <div className="flex justify-center mt-5" ref={fetchNextRef}>
          <LoadMoreButton
            isFetching={fetcher.state !== 'idle'}
            hasNextPage={!!after}
            onClick={fetchNextPage}
          />
        </div>
      </div>
    </div>
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

export const meta: MetaFunction = () => {
  return [
    {
      title: `Run logs`,
    },
  ];
};
