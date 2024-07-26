import type { PropsWithChildren } from 'react';
import React, { useState } from 'react';
import { NodeResizer, useReactFlow } from '@xyflow/react';

import { CommentEditor } from '~/components/pages/pipelines/CommentNode/CommentEditor';
import type { IBlockConfig } from '~/components/pages/pipelines/pipeline.types';
import { useRunPipelineNode } from '~/components/pages/pipelines/RunPipelineProvider';
import { cn } from '~/utils/cn';

import { CommentNodeToolbar, DEFAULT_COLOR } from './CommentNodeToolbar';

export interface CommentNodeProps extends PropsWithChildren {
  data: IBlockConfig;
  selected: boolean;
  disabled?: boolean;
  className?: string;
  width?: number;
  height?: number;
  draggable?: boolean;
  id: string;
}
export function CommentNode({
  data,
  selected,
  children,
  className,
  width,
  height,
  disabled,
  draggable,
  id,
}: CommentNodeProps) {
  const { updateNode } = useReactFlow();
  const [currentColor, setCurrentColor] = useState(
    data.opts['color'] ?? DEFAULT_COLOR,
  );
  const { status } = useRunPipelineNode(data);

  const update = ({ color, content }: { color?: string; content?: string }) => {
    updateNode(id, {
      data: {
        ...data,
        opts: { ...data.opts, color: color ?? currentColor, content },
      },
    });

    if (color) setCurrentColor(color);
  };

  return (
    <section
      aria-label={`Block: ${data.name}`}
      data-testid="builder-block"
      data-active={status}
      style={{ width: width, height: height, backgroundColor: currentColor }}
      className={cn(
        'min-w-[180px] min-h-[100px] w-full h-full break-words rounded-lg transition border border-transparent nowheel hover:border-blue-700',
        { 'border-blue-400 nodrag cursor-default border': selected },
        className,
      )}
    >
      <NodeResizer
        isVisible={draggable && !disabled}
        minWidth={180}
        minHeight={100}
        lineClassName="!border-none"
        handleClassName={cn({
          '!w-0 !h-0': !selected,
          '!w-3.5 !h-3.5 !rounded-full !border-2 !bg-blue-400': selected,
        })}
      />

      {children}

      <div className="w-full h-full overflow-hidden">
        <CommentEditor
          triggerFocus={selected}
          onBlur={update}
          content={data.opts['content']}
        >
          <CommentNodeToolbar
            visible={selected}
            onChange={update}
            color={currentColor}
          />
        </CommentEditor>
      </div>
    </section>
  );
}
