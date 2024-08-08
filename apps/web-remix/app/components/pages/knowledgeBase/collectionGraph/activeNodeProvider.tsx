import { createContext, useContext } from 'react';

import type { IMemoryNode } from '~/components/pages/knowledgeBase/knowledgeBase.types';

interface IActiveNodeContext {
  activeNode: IMemoryNode | null;
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
