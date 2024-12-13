import React, { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { ItemList } from '~/components/list/ItemList';
import { RunLogs } from '~/components/pages/pipelines/components/RunLogs';
import {
  Log,
  LogBlockName,
  LogDate,
  LogMessage,
  LogsEmptyMessage,
  LogsLoadMoreWrapper,
  LogsWrapper,
  LogTopic,
  LogTypes,
  RunLogsFilter,
} from '~/components/pages/pipelines/components/RunLogs.components';
import { LoadMoreButton } from '~/components/pagination/LoadMoreButton';
import { Label } from '~/components/ui/label';
import { cn } from '~/utils/cn';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';
import { buildUrlWithParams } from '~/utils/url';

import type { loader } from './loader.server';

export function PipelineRunLogs() {
  const navigate = useNavigate();
  const { pipeline, blockName, pipelineRun, pagination, logs } =
    useLoaderData<typeof loader>();

  const onFilter = (blockName?: string) => {
    const urlWithParams = buildUrlWithParams(
      routes.pipelineRunLogs(
        pipeline.organization_id,
        pipeline.id,
        pipelineRun.id,
      ),
      {
        block_name: blockName,
      },
    );

    navigate(urlWithParams);
  };

  const onBlockSelect = (blockName: string) => {
    onFilter(blockName);
  };

  const onClear = () => {
    onFilter();
  };

  const options = useMemo(() => {
    return pipelineRun.config.blocks.map((block) => ({
      value: block.name,
      label: block.name,
    }));
  }, [pipelineRun.config.blocks]);

  if (pagination.total === 0 && !blockName) {
    return (
      <LogsEmptyMessage
        organizationId={pipeline.organization_id}
        pipelineId={pipeline.id}
        className="mt-10"
      />
    );
  }

  return (
    <PageContentWrapper className="mt-10">
      <Label className="block mb-2">
        <span>Filter by block</span>
        <RunLogsFilter
          value={blockName}
          onSelect={onBlockSelect}
          onClear={onClear}
          options={options}
        />
      </Label>

      <RunLogs
        key={blockName}
        blockName={blockName}
        pipelineId={pipeline.id}
        organizationId={pipeline.organization_id}
        runId={pipelineRun.id}
        defaultLogs={logs}
        defaultAfter={pagination.after}
        renderLogs={(logs, { status, fetchNext, fetchNextRef, after }) => (
          <LogsWrapper>
            <ItemList
              items={logs}
              renderItem={(log) => (
                <Log log={log} className={cn('py-1')}>
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
    </PageContentWrapper>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: `Run logs`,
    },
  ];
});
