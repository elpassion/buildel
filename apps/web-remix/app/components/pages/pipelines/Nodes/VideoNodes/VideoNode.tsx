import type { PropsWithChildren } from 'react';
import React from 'react';
import { NodeResizer } from '@xyflow/react';

import type { IBlockConfig } from '~/components/pages/pipelines/pipeline.types';
import { cn } from '~/utils/cn';

export interface VideoNodeProps extends PropsWithChildren {
  data: IBlockConfig;
  selected: boolean;
  disabled?: boolean;
  className?: string;
  width?: number;
  height?: number;
  draggable?: boolean;
  id?: string;
}
export function VideoNode({
  data,
  selected,
  children,
  className,
  width,
  height,
  disabled,
  draggable,
}: VideoNodeProps) {
  return (
    <section
      aria-label={`Block: ${data.name}`}
      data-testid="builder-block"
      style={{ width: width, height: height }}
      className={cn(
        'min-w-[180px] min-h-[100px] w-full h-full break-words rounded-lg transition border border-transparent nowheel',
        {
          'border-blue-400 cursor-default border': selected,
          nodrag: selected || disabled,
        },
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
      <div className="w-full h-full overflow-hidden">{children}</div>
    </section>
  );
}
