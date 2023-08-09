'use client';

// https://kentcdodds.com/blog/how-to-use-react-context-effectively

import React from 'react';
import { Channel, Socket } from 'phoenix';
import { useEffectOnce } from '~/utils/hooks';

type Action =
  | {
      type: 'setAudioFile';
      audioFile: File | null;
    }
  | {
      type: 'addBlock';
      name: string;
    }
  | {
      type: 'speechToTextOutput';
      payload: { message: string; is_final: boolean } | null;
    };
type Dispatch = (action: Action) => void;
type State = {
  socket: Socket;
  channel: Channel;
  blocks: string[];
  audioFile: File | null;
  speechToTextOutput: { message: string; is_final: boolean } | null;
};
type Value = [state: State, dispatch: Dispatch];

const BlocksStateContext = React.createContext<Value | undefined>(undefined);

function blocksReducer(state: State, action: Action) {
  switch (action.type) {
    case 'setAudioFile': {
      return { ...state, audioFile: action.audioFile };
    }
    case 'addBlock': {
      const blocks = [...state.blocks, action.name];
      return { ...state, blocks };
    }
    case 'speechToTextOutput': {
      return { ...state, speechToTextOutput: action.payload };
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
  let socket = new Socket('ws://192.168.0.12:4000/socket');
  socket.connect();

  let channel = socket.channel(`audio_conversations:${Math.random()}`, {});

  useEffectOnce(() => {
    channel
      .join()
      .receive('ok', (resp) => {
        console.log('Joined successfully', resp);
      })
      .receive('error', (resp) => {
        console.log('Unable to join', resp);
      });

    // channel.on('text_to_speech_output', (payload) => {
    //   console.log('text_to_speech_output', payload);
    // });
    // channel.on('speech_to_text_output', (payload) => {
    //   console.log('speech_to_text_output', payload);
    // });
    // channel.on('chat_sentences_output', (payload) => {
    //   console.log('chat_sentences_output', payload);
    // });

    // @ts-ignore
    window.channel = channel;
  });

  const [state, dispatch] = React.useReducer(blocksReducer, {
    audioFile: null,
    blocks: [],
    socket,
    channel,
    speechToTextOutput: null,
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
