import { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import {
  LogsEmptyMessage,
  RunLogs,
  RunLogsFilter,
} from '~/components/pages/pipelines/components/RunLogs';
import { Label } from '~/components/ui/label';
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

  if (pagination.total === 0) {
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
        defaultLogs={logs}
        defaultAfter={pagination.after}
        pipelineId={pipeline.id}
        organizationId={pipeline.organization_id}
        runId={pipelineRun.id}
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
