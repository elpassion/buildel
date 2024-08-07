import React, { useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';

import { cn } from '~/utils/cn';

import { useActiveNode } from '../activeNodeProvider';
import type { IEmbeddingNode } from '../collectionGraph.types';

export function EmbeddingNode(props: IEmbeddingNode) {
  const { activeNode } = useActiveNode();

  const isActive = useMemo(() => {
    return activeNode?.id === props.id;
  }, [activeNode]);

  const isRelated = useMemo(() => {
    return activeNode?.data.memory_id === props.data.memory_id;
  }, [activeNode]);

  const activeStyles = useMemo(() => {
    if (!activeNode) return;

    if (isActive) return props.data.base_color;
    if (isRelated) return `${props.data.base_color} bg-opacity-80`;

    return 'bg-gray-200';
  }, [isActive, isRelated, activeNode]);

  return (
    <>
      <Handle
        id="a"
        type="source"
        position={Position.Right}
        className="opacity-0"
      />
      <div
        className={cn(
          'group relative h-5 w-5 rounded-full hover:bg-purple-600',
          props.data.base_color,
          activeStyles,
        )}
      >
        <div
          className={cn(
            'absolute top-1/2 left-[110%] -translate-y-1/2 hidden group-hover:block whitespace-nowrap',
            {
              block: isActive || isRelated,
              'text-[10px]': isRelated && !isActive,
            },
          )}
        >
          {props.data.content.slice(0, 50)}
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="opacity-0" />
    </>
  );
}
