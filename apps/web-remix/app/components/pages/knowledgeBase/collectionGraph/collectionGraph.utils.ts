import type { Edge } from '@xyflow/react';

import type { IMemoryNode } from '~/components/pages/knowledgeBase/knowledgeBase.types';
import { hashString } from '~/utils/stringHash';

import type { IEmbeddingNode, IPrevNextNode } from './collectionGraph.types';

export const NEXT_NODE_COLOR = '#be123c';
export const PREV_NODE_COLOR = '#000';
export const SEARCH_NODE_COLOR = '#fde047';

export function toEmbeddingNodes(nodes: IMemoryNode[]): IEmbeddingNode[] {
  return nodes.map((item) => ({
    data: {
      ...item,
      base_color: getColorForUid(item.memory_id.toString()),
    },
    position: { x: item.point[0] * 35, y: item.point[1] * 35 },
    id: item.id.toString(),
    type: 'embedding',
  }));
}

export function generateActiveNodeEdges(
  activeNodeId: IPrevNextNode,
  prevNodeId: IPrevNextNode,
  nextNodeId: IPrevNextNode,
): Edge[] {
  if (!activeNodeId) return [];
  const edges: Edge[] = [];

  if (prevNodeId) {
    edges.push({
      id: `${prevNodeId}-${activeNodeId}`,
      source: prevNodeId.toString(),
      target: activeNodeId.toString(),
      type: 'straight',
    });
  }

  if (nextNodeId) {
    edges.push({
      id: `${activeNodeId}-${nextNodeId}`,
      source: activeNodeId.toString(),
      target: nextNodeId.toString(),
      type: 'straight',
    });
  }

  return edges;
}

const colors: Record<string, string> = {};

function getColorForUid(uid: string): string {
  if (colors[uid]) return colors[uid];

  const hsl = generateHSLColor(hashString(uid));

  colors[uid] = hsl;

  return hsl;
}

const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;

function generateHSLColor(hash: number): string {
  const hue = (Math.abs(hash * GOLDEN_RATIO_CONJUGATE) % 1.0) * 360;
  const saturation = 50 + (Math.abs(hash * 0.3) % 50);
  const lightness = 50 + (Math.abs(hash * 0.2) % 30);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
