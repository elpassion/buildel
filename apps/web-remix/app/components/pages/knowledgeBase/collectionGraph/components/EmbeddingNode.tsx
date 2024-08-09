import type { CSSProperties } from 'react';
import React, { useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';

import {
  NEXT_NODE_COLOR,
  PREV_NODE_COLOR,
  SEARCH_NODE_COLOR,
} from '~/components/pages/knowledgeBase/collectionGraph/collectionGraph.utils';
import { cn } from '~/utils/cn';

import { useActiveNode } from '../activeNodeProvider';
import type { IEmbeddingNode } from '../collectionGraph.types';

export function EmbeddingNode(props: IEmbeddingNode) {
  const { activeNode, relatedNeighbours, prevNode, nextNode, searchChunks } =
    useActiveNode();

  const isSearched = useMemo(() => {
    return searchChunks.map((searchChunk) => searchChunk.id).includes(props.id);
  }, [searchChunks]);
  const isRelated = useMemo(() => {
    return relatedNeighbours.includes(props.id);
  }, [relatedNeighbours]);
  const isActive = useMemo(() => {
    return activeNode?.id === props.id;
  }, [activeNode]);
  const hasHandles = useMemo(() => {
    return isActive || prevNode === props.id || nextNode === props.id;
  }, [isActive, prevNode, nextNode]);

  const activeStyles = useMemo(() => {
    if (!activeNode && searchChunks.length === 0) {
      return {
        backgroundColor: props.data.base_color,
        borderColor: props.data.base_color,
      };
    } else if (
      isSearched ||
      isActive ||
      prevNode === props.id ||
      nextNode === props.id
    ) {
      return {
        backgroundColor: props.data.base_color,
        opacity: 1,
      };
    } else if (isRelated) {
      return {
        backgroundColor: props.data.base_color,
        opacity: 0.5,
      };
    } else {
      return {
        backgroundColor: '#aaa',
        opacity: 0.2,
      };
    }
  }, [activeNode, searchChunks, isSearched, isActive, isRelated]);

  const innerCircleColor = useMemo(() => {
    if (prevNode === props.id) return PREV_NODE_COLOR;
    if (nextNode === props.id) return NEXT_NODE_COLOR;
    if (isSearched) return SEARCH_NODE_COLOR;
    return props.data.base_color;
  }, [prevNode, nextNode, isSearched]);

  return (
    <>
      {hasHandles && (
        <Handle
          type="source"
          position={Position.Top}
          className="!top-1/2 !left-1/2 opacity-0 !pointer-events-none !w-[1px] !h-[1px]"
        />
      )}
      <div
        data-nodecircle={props.id}
        style={activeStyles}
        className={cn(
          'group relative h-6 w-6 rounded-full hover:!bg-purple-600',
        )}
      >
        <div
          className="absolute inset-1 rounded-full bg-[#facc15]"
          style={{ backgroundColor: innerCircleColor }}
        ></div>
      </div>

      {hasHandles && (
        <Handle
          type="target"
          position={Position.Top}
          className="!top-1/2 !left-1/2 opacity-0 !pointer-events-none !w-[1px] !h-[1px]"
        />
      )}
    </>
  );
}
