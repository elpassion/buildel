import type { CSSProperties } from 'react';
import React, { useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';

import { cn } from '~/utils/cn';

import { useActiveNode } from '../activeNodeProvider';
import type { IEmbeddingNode } from '../collectionGraph.types';

export function EmbeddingNode(props: IEmbeddingNode) {
  const { activeNode, relatedNeighbours, prevNode, nextNode } = useActiveNode();

  const isRelated = (id: string) => {
    return relatedNeighbours.includes(id);
  };

  const isActive = useMemo(() => {
    return activeNode?.id === props.id;
  }, [activeNode]);

  const activeStyles = useMemo(() => {
    if (!activeNode) {
      return {
        backgroundColor: props.data.base_color,
        borderColor: props.data.base_color,
      };
    }

    const styles: CSSProperties = {};

    if (isActive) {
      styles.backgroundColor = props.data.base_color;
    } else if (prevNode === props.id) {
      styles.backgroundColor = 'black';
    } else if (nextNode === props.id) {
      styles.backgroundColor = 'red';
    } else if (isRelated(props.id)) {
      styles.opacity = 0.5;
      styles.backgroundColor = props.data.base_color;
    } else {
      styles.opacity = 0.2;
      styles.backgroundColor = '#aaa';
    }

    return styles;
  }, [isActive, prevNode, nextNode]);

  return (
    <>
      <Handle
        id="a"
        type="source"
        position={Position.Top}
        className="!top-1/2 !left-1/2 opacity-0 !pointer-events-none !w-[1px] !h-[1px]"
      />
      <div
        data-nodecircle={props.id}
        style={activeStyles}
        className={cn(
          'group relative h-6 w-6 rounded-full hover:!bg-purple-600',
        )}
      />

      <Handle
        type="target"
        position={Position.Top}
        className="!top-1/2 !left-1/2 opacity-0 !pointer-events-none !w-[1px] !h-[1px]"
      />
    </>
  );
}
