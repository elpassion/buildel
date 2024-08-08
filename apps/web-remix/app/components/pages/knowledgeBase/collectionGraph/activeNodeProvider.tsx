import { createContext, useContext } from 'react';

import type { IEmbeddingNode } from './collectionGraph.types';

interface IActiveNodeContext {
  activeNode: IEmbeddingNode | null;
  relatedNeighbours: string[];
}

export const ActiveNodeContext = createContext<IActiveNodeContext | null>(null);
export const ActiveNodeProvider = ActiveNodeContext.Provider;
export const useActiveNode = () => {
  const context = useContext(ActiveNodeContext);
  if (!context) {
    throw new Error('useActiveNode must be used within a ActiveNodeProvider');
  }
  return context;
};
