'use client';

// https://kentcdodds.com/blog/how-to-use-react-context-effectively

import React from 'react';
import { Channel, Socket } from 'phoenix';
import { useEffectOnce } from '~/utils/hooks';

type Action = {
  type: 'test';
};
type Dispatch = (action: Action) => void;
type State = {
  socket: Socket;
  channel: Channel;
};
type Value = [state: State, dispatch: Dispatch];

const BlocksStateContext = React.createContext<Value | undefined>(undefined);

function blocksReducer(state: State, action: Action) {
  switch (action.type) {
    case 'test': {
      return state;
    }
    default: {
      // @ts-ignore
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

type BlocksProviderProps = {
  children: React.ReactNode;
};
function BlocksProvider({ children }: BlocksProviderProps) {
  const socket = new Socket(`ws://${process.env.API_URL}/socket`);
  socket.connect();

  const channel = socket.channel(`audio_conversations:${Math.random()}`, {});

  useEffectOnce(() => {
    channel
      .join()
      .receive('ok', (resp) => {
        console.log('Joined successfully', resp);
      })
      .receive('error', (resp) => {
        console.log('Unable to join', resp);
      });

    // @ts-ignore
    window.channel = channel;
  });

  const [state, dispatch] = React.useReducer(blocksReducer, {
    socket,
    channel,
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
