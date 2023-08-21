'use client';

// https://kentcdodds.com/blog/how-to-use-react-context-effectively

import React from 'react';
import { useToggle } from '@mantine/hooks';

type Action =
  | {
      type: 'toggleSidebar';
      value?: boolean;
    }
  | {
      type: 'closeSidebar';
    }
  | {
      type: 'openSidebar';
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
      return { ...state, isSidebarOpen: !state.isSidebarOpen };
    }
    case 'closeSidebar': {
      return { ...state, isSidebarOpen: false };
    }
    case 'openSidebar': {
      return { ...state, isSidebarOpen: true };
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
