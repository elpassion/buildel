'use client';

// https://kentcdodds.com/blog/how-to-use-react-context-effectively

import React from 'react';
import { useToggle } from '@mantine/hooks';

type Action =
  | {
      type: 'toggleSidebar';
      isSidebarOpen?: boolean;
    }
  | {
      type: 'toggleSidebarCollapse';
      isSidebarCollapsed?: boolean;
    };
type Dispatch = (action: Action) => void;
type State = {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
};
type Value = [state: State, dispatch: Dispatch];

const LayoutStateContext = React.createContext<Value | undefined>(undefined);

function layoutReducer(state: State, action: Action) {
  switch (action.type) {
    case 'toggleSidebar': {
      const value = action.isSidebarOpen;
      return { ...state, isSidebarOpen: value ?? !state.isSidebarOpen };
    }
    case 'toggleSidebarCollapse': {
      const value = action.isSidebarCollapsed;
      return {
        ...state,
        isSidebarCollapsed: value ?? !state.isSidebarCollapsed,
      };
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
  const [state, dispatch] = React.useReducer(layoutReducer, {
    isSidebarOpen: false,
    isSidebarCollapsed: true,
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
