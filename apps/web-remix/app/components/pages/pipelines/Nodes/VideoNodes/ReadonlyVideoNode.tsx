import React from 'react';

import {
  CustomNode,
  CustomNodeHeader,
} from '~/components/pages/pipelines/Nodes/CustomNodes/CustomNode';
import { VideoPreview } from '~/components/pages/pipelines/Nodes/VideoNodes/VideoNodePreview';
import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';

import type { VideoNodeProps } from './VideoNode';

export function ReadonlyVideoNode({
  data,
  selected,
  disabled,
  className,
  ...rest
}: VideoNodeProps) {
  const url = data.opts['url'];
  const { status: runStatus } = useRunPipeline();
  const isDisabled = runStatus !== 'idle' || disabled;

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

        <div className="flex justify-center items-center h-full py-3">
          <p className="text-xs">There is no video URL provided.</p>
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
