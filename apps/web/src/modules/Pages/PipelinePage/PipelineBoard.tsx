'use client';

import React, { PropsWithChildren, useCallback, useState } from 'react';
import { PipelineFlow } from '~/modules/Pages/PipelinePage/PipelineFlow';
import {
  useBlockTypes,
  usePipeline,
  useUpdatePipeline,
} from '~/modules/Pipelines';
import {
  IBlockConfig,
  IPipeline,
  IPipelineConfig,
} from '~/modules/Pipelines/pipelines.types';
import { assert } from '~/utils/assert';
import { PipelineHeader } from './PipelineHeader';
import 'reactflow/dist/style.css';

interface PipelineBoardProps extends PropsWithChildren {
  pipelineId: string;
  initialData?: IPipeline;
}

export function PipelineBoard({
  pipelineId,
  initialData,
  children,
}: PipelineBoardProps) {
  const { data: blockTypes } = useBlockTypes();
  const { data: pipeline, isLoading } = usePipeline(pipelineId, {
    initialData,
  });

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
    <div className="relative h-[90vh] w-full">
      <PipelineFlow
        pipeline={pipeline}
        blockTypes={blockTypes}
        onUpdate={handleUpdate}
        onCreate={handleAddBlock}
      />
      {children}

      <div className="absolute right-0 top-0 flex gap-2">
        <PipelineHeader isUpdating={isUpdating} onSave={handleSave} />
      </div>
    </div>
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
