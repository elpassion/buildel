'use client';

// https://kentcdodds.com/blog/how-to-use-react-context-effectively

import React from 'react';

type Action = {
  type: 'toggleSidebar';
  toggleSidebar: () => void;
};
type Dispatch = (action: Action) => void;
type State = {
  isSidebarOpen: boolean;
};
type Value = [state: State, dispatch: Dispatch];

const LayoutStateContext = React.createContext<Value | undefined>(undefined);

function layoutReducer(state: State, action: Action) {
  switch (action.type) {
    case 'toggleSidebar': {
      return state;
    }
    default: {
      // @ts-ignore
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

type LayoutProviderProps = {
  children: React.ReactNode;
};
function LayoutProvider({ children }: LayoutProviderProps) {
  // Sidebar
  const [isSidebarOpen, setSidebarOpen] = React.useState<boolean>(false);

  const [state, dispatch] = React.useReducer(layoutReducer, {
    isSidebarOpen,
  });
  const value: Value = [state, dispatch];
  return (
    <LayoutStateContext.Provider value={value}>
      {children}
    </LayoutStateContext.Provider>
  );
}

function useLayout() {
  const context = React.useContext(LayoutStateContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

export { LayoutProvider, useLayout };
