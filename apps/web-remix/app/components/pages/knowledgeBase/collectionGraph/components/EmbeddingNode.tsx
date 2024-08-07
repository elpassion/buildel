import type { CSSProperties } from 'react';
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

  const activeStyles = useMemo((): CSSProperties => {
    if (!activeNode) return { backgroundColor: props.data.base_color };

    if (isActive) {
      return { backgroundColor: props.data.base_color };
    }
    if (isRelated) {
      return { backgroundColor: props.data.base_color, opacity: 0.8 };
    }

    return { backgroundColor: '#aaa', opacity: 0.5 };
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
        style={activeStyles}
        className={cn(
          'group relative h-5 w-5 rounded-full hover:!bg-purple-600',
        )}
      />

      <Handle type="target" position={Position.Left} className="opacity-0" />
    </>
  );
}
