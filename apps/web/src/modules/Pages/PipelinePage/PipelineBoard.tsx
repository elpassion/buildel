'use client';

import React, { PropsWithChildren, useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { PipelineFlow } from '~/modules/Pages/PipelinePage/PipelineFlow';
import {
  useBlockTypes,
  usePipeline,
  usePipelineRun,
  useUpdatePipeline,
} from '~/modules/Pipelines';
import {
  IBlockConfig,
  IBlockTypesObj,
  IPipeline,
  IPipelineConfig,
} from '~/modules/Pipelines/pipelines.types';
import { assert } from '~/utils/assert';
import { PipelineHeader } from './PipelineHeader';
import { Button } from '@elpassion/taco';
import 'reactflow/dist/style.css';

interface PipelineBoardProps extends PropsWithChildren {
  pipelineId: string;
  initialPipeline?: IPipeline;
  initialBlockTypes?: IBlockTypesObj;
}

export function PipelineBoard({
  pipelineId,
  initialPipeline,
  initialBlockTypes,
  children,
}: PipelineBoardProps) {
  const { data: blockTypes } = useBlockTypes({
    initialData: initialBlockTypes,
  });
  const { data: pipeline, isLoading } = usePipeline(pipelineId, {
    initialData: initialPipeline,
  });

  const {
    status: runStatus,
    startRun,
    stopRun: stopRunBase,
    push,
    io,
  } = usePipelineRun(pipelineId, (block, output, payload) => {
    console.log(block, output, payload);
    // setEvents((events) => [...events, { block, output, payload }]);
  });

  // @ts-ignore
  window.push = push;

  const { mutateAsync: updatePipeline, isLoading: isUpdating } =
    useUpdatePipeline(pipelineId);

  const handleUpdate = useCallback(
    async (updated: IPipelineConfig) => {
      assert(pipeline);

      await updatePipeline({
        config: { version: pipeline.config.version, ...updated },
        name: pipeline.name,
      });
    },
    [pipeline],
  );

  //handle saving on click
  const handleSave = useCallback(() => {
    assert(pipeline);
  }, [pipeline]);

  const handleAddBlock = useCallback(
    async (data: IBlockConfig) => {
      assert(pipeline);

      const sameBlockTypes = getAllBlockTypes(pipeline, data.type);
      const nameNum = getLastBlockNumber(sameBlockTypes) + 1;
      const name = `${data.type.toLowerCase()}_${nameNum}`;

      const res = await updatePipeline({
        name: pipeline.name,
        config: {
          version: pipeline.config.version,
          blocks: [...pipeline.config.blocks, { ...data, name }],
        },
      });
      return res.config;
    },

    [pipeline],
  );

  if (isLoading) return <p>Loading...</p>;
  if (!pipeline || !blockTypes) return;

  return (
    <ReactFlowProvider>
      <div className="relative h-[93vh] w-full">
        <Button
          onClick={runStatus === 'idle' ? startRun : stopRunBase}
          text={runStatus === 'idle' ? 'Start' : 'Stop'}
          disabled={runStatus === 'starting'}
        />
        <PipelineFlow
          pipeline={pipeline}
          blockTypes={blockTypes}
          onUpdate={handleUpdate}
          onCreate={handleAddBlock}
        />

        {children}

        <div className="absolute right-3 top-3 flex gap-2">
          <PipelineHeader isUpdating={isUpdating} onSave={handleSave} />
        </div>
      </div>
    </ReactFlowProvider>
  );
}

function getAllBlockTypes(pipeline: IPipeline, type: string): IBlockConfig[] {
  return pipeline.config.blocks.filter((block) => block.type === type);
}

function getLastBlockNumber(blocks: IBlockConfig[]) {
  const nrs = blocks
    .map((block) => block.name.split('_'))
    .map((part) => Number.parseInt(part[part.length - 1]))
    .filter((n) => !isNaN(n));

  return Math.max(...nrs, 0);
}
