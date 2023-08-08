'use client';

import React from 'react';
import { Button, Group, Text } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import {
  AudioToTextBlock,
  FileAudioInput,
  TextToAudioBlock,
  useBlocks,
} from '~/modules/Blocks';
import { ChatGPTBlock } from '~/modules/Blocks/ChatGPTBlock';

interface BlockItem {
  name: string;
  component: any;
}

export const ExampleClient = () => {
  // https://dev.to/shubhamtiwari909/react-hooks-library-mantine-part-1-ck6
  // https://v7.mantine.dev/hooks/use-list-state
  const [blocks, setBlocks] = React.useState<BlockItem[]>([]);

  const [state, dispatch] = useBlocks();

  return (
    <>
      <Text>Select blocks to add</Text>

      <div className="mb-4" />

      <Group>
        <Button
          color="red"
          onClick={() => {
            setBlocks([]);
            // blocksHandlers.setState([]);
            // dispatch({ type: 'setAudioFile', audioFile: null });
          }}
        >
          Reset
        </Button>
        <Button
          onClick={() => {
            console.log('play');
          }}
        >
          Play
        </Button>
      </Group>

      <div className="mb-4" />

      <Group>
        <Button
          onClick={() => {
            setBlocks((prevState) => [
              ...prevState,
              {
                name: 'fileAudioInput',
                component: <FileAudioInput enabled={true} />,
              },
            ]);
            // blocksHandlers.append({
            //   name: 'fileAudioInput',
            //   component: <FileAudioInput enabled={true} />,
            // });
          }}
        >
          File audio input
        </Button>
        <Button
          onClick={() => {
            setBlocks((prevState) => [
              ...prevState,
              {
                name: 'audioToText',
                component: <AudioToTextBlock enabled={true} />,
              },
            ]);
            // blocksHandlers.append({
            //   name: 'audioToText',
            //   component: <AudioToTextBlock enabled={true} />,
            // });
          }}
        >
          Audio to text
        </Button>
        <Button
          onClick={() => {
            setBlocks((prevState) => [
              ...prevState,
              {
                name: 'textToAudio',
                component: <TextToAudioBlock enabled={true} />,
              },
            ]);
            // blocksHandlers.append({
            //   name: 'textToAudio',
            //   component: <TextToAudioBlock enabled={true} />,
            // });
          }}
        >
          Text to audio
        </Button>
        <Button
          onClick={() => {
            setBlocks((prevState) => [
              ...prevState,
              {
                name: 'chat',
                component: <ChatGPTBlock enabled={true} />,
              },
            ]);
            // blocksHandlers.append({
            //   name: 'chat',
            //   component: <ChatGPTBlock enabled={true} />,
            // });
          }}
        >
          Chat
        </Button>
      </Group>

      <div className="mb-12" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {blocks.map((block, index) => {
          return <div key={`${block.name}-${index}`}>{block.component}</div>;
        })}
      </div>
    </>
  );
};
