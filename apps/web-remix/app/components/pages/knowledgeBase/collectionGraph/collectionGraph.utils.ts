import type { IMemoryNode } from '~/components/pages/knowledgeBase/knowledgeBase.types';
import { hashString } from '~/utils/stringHash';

import type { IEmbeddingNode } from './collectionGraph.types';

export function toEmbeddingNodes(nodes: IMemoryNode[]): IEmbeddingNode[] {
  return nodes.map((item) => ({
    data: {
      ...item,
      base_color: getColorForUid(item.memory_id.toString()),
    },
    position: { x: item.point[0] * 25, y: item.point[1] * 25 },
    id: item.id.toString(),
    type: 'embedding',
  }));
}

const colors: Record<string, string> = {};

function getColorForUid(uid: string): string {
  if (colors[uid]) return colors[uid];

  const rgb = generateRGBColor(hashString(uid));

  colors[uid] = rgb;

  return rgb;
}

function generateRGBColor(hash: number): string {
  const r = Math.abs(hash * 0.7) % 240;
  const g = Math.abs(hash * 5.3 * hash) % 240;
  const b = Math.abs(hash * 8.3 * hash) % 240;

  return `rgb(${r}, ${g}, ${b})`;
}
