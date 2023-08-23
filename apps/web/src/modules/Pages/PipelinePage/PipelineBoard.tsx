'use client';

import React, { PropsWithChildren, useCallback } from 'react';
import { z } from 'zod';
import { AddBlockForm } from '~/modules/Pages';
import { AddBlockModal } from '~/modules/Pages/PipelinePage/AddBlockModal';
import { PipelineFlow } from '~/modules/Pages/PipelinePage/PipelineFlow';
import {
  useBlockTypes,
  usePipeline,
  useUpdatePipeline,
} from '~/modules/Pipelines';
import {
  BlockConfig,
  IPipeline,
  IPipelineConfig,
} from '~/modules/Pipelines/pipelines.types';
import { assert } from '~/utils/assert';
import { useModal } from '~/utils/hooks';
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
  const { isModalOpen, openModal, closeModal } = useModal();
  const { data: blockTypes } = useBlockTypes();
  const { data: pipeline, isLoading } = usePipeline(pipelineId, {
    initialData,
  });
  const updatePipeline = useUpdatePipeline(pipelineId);

  const handleUpdate = useCallback(
    (updated: IPipelineConfig) => {
      assert(pipeline);

      updatePipeline.mutate({
        config: { version: pipeline.config.version, ...updated },
        name: pipeline.name,
      });
    },
    [pipeline],
  );

  const handleAddBlock = useCallback(
    (data: z.TypeOf<typeof BlockConfig>) => {
      assert(pipeline);
      console.log(data);
      updatePipeline.mutate({
        name: pipeline.name,
        config: {
          version: pipeline.config.version,
          blocks: [...pipeline.config.blocks, data],
        },
      });
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
      />
      {children}
      <div className="absolute left-0 top-0">
        <button onClick={openModal}>TMP ADD</button>
      </div>

      <AddBlockModal isOpen={isModalOpen} onClose={closeModal}>
        <AddBlockForm onSubmit={handleAddBlock} />
      </AddBlockModal>
    </div>
  );
}
