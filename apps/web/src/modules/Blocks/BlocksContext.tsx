'use client';

// https://kentcdodds.com/blog/how-to-use-react-context-effectively

import React from 'react';

type Action =
  | {
      type: 'setAudioFile';
      audioFile: File | null;
    }
  | {
      type: 'setUserText';
      chunks: string[];
    };
type Dispatch = (action: Action) => void;
type State = { audioFile: File | null };
type Value = [state: State, dispatch: Dispatch];

const BlocksStateContext = React.createContext<Value | undefined>(undefined);

function blocksReducer(state: State, action: Action) {
  switch (action.type) {
    case 'setAudioFile': {
      return { ...state, audioFile: action.audioFile };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

type BlocksProviderProps = {
  children: React.ReactNode;
};
function BlocksProvider({ children }: BlocksProviderProps) {
  const [state, dispatch] = React.useReducer(blocksReducer, {
    audioFile: null,
  });
  const value: Value = [state, dispatch];
  return (
    <BlocksStateContext.Provider value={value}>
      {children}
    </BlocksStateContext.Provider>
  );
}

function useBlocks() {
  const context = React.useContext(BlocksStateContext);
  if (context === undefined) {
    throw new Error('useBlocks must be used within a BlocksProvider');
  }
  return context;
}

export { BlocksProvider, useBlocks };
