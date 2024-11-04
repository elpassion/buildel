import React from 'react';
import { useReactFlow } from '@xyflow/react';

import {
  CustomNode,
  CustomNodeHeader,
} from '~/components/pages/pipelines/Nodes/CustomNodes/CustomNode';
import { VideoNodeBody } from '~/components/pages/pipelines/Nodes/VideoNodes/VideoNodeBody';
import { VideoPreview } from '~/components/pages/pipelines/Nodes/VideoNodes/VideoNodePreview';
import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';

import type { VideoNodeProps } from './VideoNode';

export function BuilderVideoNode({
  data,
  selected,
  disabled,
  id,
  className,
  ...rest
}: VideoNodeProps) {
  const url = data.opts['url'];
  const { updateNode } = useReactFlow();
  const { status: runStatus } = useRunPipeline();
  const isDisabled = runStatus !== 'idle' || disabled;

  const update = (opts: Record<string, any>) => {
    updateNode(id ?? data.name, {
      data: {
        ...data,
        opts: { ...data.opts, ...opts },
      },
    });
  };

  if (!url) {
    return (
      <CustomNode
        disabled={isDisabled}
        data={data}
        selected={selected}
        className={className}
        {...rest}
      >
        <CustomNodeHeader data={data} />

        <div className="px-2 py-4 nodrag">
          <VideoNodeBody data={data} disabled={isDisabled} onSubmit={update} />
        </div>
      </CustomNode>
    );
  }

  return (
    <VideoPreview
      data={data}
      url={url}
      disabled={isDisabled}
      selected={selected}
      className={className}
      {...rest}
    />
  );
}
