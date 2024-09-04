import React from 'react';

import { Webchat } from '~/components/chat/Webchat';
import type { IPipeline } from '~/components/pages/pipelines/pipeline.types';

interface ELChatProps {
  pipelineId: string | number;
  el: IPipeline;
  organizationId: string | number;
  onBlockOutput?: (
    blockId: string,
    outputName: string,
    payload: unknown,
  ) => void;
  onBlockStatusChange?: (blockId: string, isWorking: boolean) => void;
}

export const ELChat = ({
  el,
  pipelineId,
  organizationId,
  onBlockOutput,
  onBlockStatusChange,
}: ELChatProps) => {
  return (
    <Webchat
      placeholder="e.g. Create a block that will retrieve current weather in New York..."
      organizationId={organizationId.toString()}
      onBlockStatusChange={onBlockStatusChange}
      onBlockOutput={onBlockOutput}
      pipelineId={el.id.toString()}
      pipeline={el}
      metadata={{
        pipeline_id: pipelineId,
      }}
    />
  );
};
