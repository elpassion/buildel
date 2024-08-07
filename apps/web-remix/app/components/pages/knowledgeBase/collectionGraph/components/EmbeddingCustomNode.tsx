import React, { useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';

import { cn } from '~/utils/cn';
import { hashString } from '~/utils/stringHash';

import { useActiveNode } from '../activeNodeProvider';
import type { EmbeddingNode } from '../collectionGraph.types';

export function EmbeddingCustomNode(props: EmbeddingNode) {
  const { activeNode } = useActiveNode();

  const isActive = useMemo(() => {
    return activeNode?.id === props.id;
  }, [activeNode]);

  const isRelated = useMemo(() => {
    return activeNode?.data.document_id === props.data.document_id;
  }, [activeNode]);

  const activeStyles = useMemo(() => {
    if (!activeNode) return;

    if (isActive) return 'bg-lime-600';
    if (isRelated) return 'bg-lime-300';

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
          props.data.base_color ?? 'bg-gray-200',
          // getColorForUid(props.data.document_id),
          activeStyles,
        )}
      >
        <div
          className={cn(
            'absolute top-1/2 left-[110%]  whitespace-nowrap -translate-y-1/2 hidden group-hover:block',
            {
              block: isActive || isRelated,
              'text-[10px]': isRelated && !isActive,
            },
          )}
        >
          {props.data.document}
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="opacity-0" />
    </>
  );
}
