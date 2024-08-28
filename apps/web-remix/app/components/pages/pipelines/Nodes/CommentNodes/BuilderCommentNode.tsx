import React, { useState } from 'react';
import { useReactFlow } from '@xyflow/react';

import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';
import { cn } from '~/utils/cn';

import { CommentEditor } from './CommentEditor';
import type { CommentNodeProps } from './CommentNode';
import { CommentNode } from './CommentNode';
import { CommentNodeToolbar, DEFAULT_COLOR } from './CommentNodeToolbar';

export function BuilderCommentNode({
  data,
  selected,
  disabled,
  id,
  className,
  ...rest
}: CommentNodeProps) {
  const { updateNode } = useReactFlow();
  const { status: runStatus } = useRunPipeline();
  const [currentColor, setCurrentColor] = useState(
    data.opts['color'] ?? DEFAULT_COLOR,
  );
  const update = ({ color, content }: { color?: string; content?: string }) => {
    updateNode(id ?? data.name, {
      data: {
        ...data,
        opts: { ...data.opts, color: color ?? currentColor, content },
      },
    });

    if (color) setCurrentColor(color);
  };

  const isDisabled = runStatus !== 'idle' || disabled;

  return (
    <CommentNode
      data={data}
      id={id}
      disabled={isDisabled}
      selected={selected}
      color={currentColor}
      className={cn('hover:border-blue-700', className)}
      {...rest}
    >
      <CommentEditor
        triggerFocus={selected}
        onBlur={update}
        content={data.opts['content']}
        disabled={isDisabled}
      >
        <CommentNodeToolbar
          visible={!isDisabled && selected}
          onChange={update}
          color={currentColor}
        />
      </CommentEditor>
    </CommentNode>
  );
}
