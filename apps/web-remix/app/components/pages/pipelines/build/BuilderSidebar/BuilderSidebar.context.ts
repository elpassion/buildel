import React from 'react';

export type BuilderSidebarState = 'open' | 'closed' | 'keepOpen';

export interface IBuilderSidebarContext {
  state: BuilderSidebarState;
  onPinClick: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export const BuilderSidebarContext = React.createContext<
  IBuilderSidebarContext | undefined
>(undefined);

export const useBuilderSidebar = () => {
  const context = React.useContext(BuilderSidebarContext);
  if (context === undefined) {
    throw new Error('useBuilderSidebar must be used within a BuilderSidebar');
  }
  return context;
};
