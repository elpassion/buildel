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

const bgColors = [
  'bg-sky-500',
  'bg-yellow-500',
  'bg-stone-500',
  'bg-slate-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-rose-500',
  'bg-lime-500',
];

function getColorForUid(uid: string): string {
  const hash = hashString(uid);
  const colorIndex = Math.abs(hash) % bgColors.length;
  return bgColors[colorIndex];
}
