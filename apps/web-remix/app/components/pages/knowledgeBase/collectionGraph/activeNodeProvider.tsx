import { createContext, use } from 'react';

import type { IKnowledgeBaseSearchChunk } from '~/api/knowledgeBase/knowledgeApi.contracts';
import type { IPrevNextNode } from '~/components/pages/knowledgeBase/collectionGraph/collectionGraph.types';
import type { IMemoryNode } from '~/components/pages/knowledgeBase/knowledgeBase.types';

interface IActiveNodeContext {
  activeNode: IMemoryNode | null;
  relatedNeighbours: string[];
  searchChunks: IKnowledgeBaseSearchChunk[];
  prevNode: IPrevNextNode;
  nextNode: IPrevNextNode;
}

export const ActiveNodeContext = createContext<IActiveNodeContext | null>(null);
export const ActiveNodeProvider = ActiveNodeContext.Provider;
export const useActiveNode = () => {
  const context = use(ActiveNodeContext);
  if (!context) {
    throw new Error('useActiveNode must be used within a ActiveNodeProvider');
  }
  return context;
};
