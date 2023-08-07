'use client';

import { Button, Group, Text } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import {
  AudioToTextBlock,
  BlocksProvider,
  FileAudioInput,
  TextToAudioBlock,
} from '~/modules/Blocks';

interface BlockItem {
  name: string;
  component: any;
}

export const ExampleClient = () => {
  // https://dev.to/shubhamtiwari909/react-hooks-library-mantine-part-1-ck6
  // https://v7.mantine.dev/hooks/use-list-state
  const [blocks, blocksHandlers] = useListState<any>([]);

  return (
    <>
      <Text>Select blocks to add</Text>

      <div className="mb-4" />

      <Group>
        <Button
          onClick={() => {
            blocksHandlers.append({
              name: 'fileAudioInput',
              component: <FileAudioInput enabled={true} />,
            });
          }}
        >
          File audio input
        </Button>
        <Button
          onClick={() => {
            blocksHandlers.append({
              name: 'audioToText',
              component: <AudioToTextBlock enabled={true} />,
            });
          }}
        >
          Audio to text
        </Button>
        <Button
          onClick={() => {
            blocksHandlers.append({
              name: 'textToAudio',
              component: <TextToAudioBlock enabled={true} />,
            });
          }}
        >
          Text to audio
        </Button>
      </Group>

      <div className="mb-4" />

      <BlocksProvider>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {blocks.map((val, index) => {
            return <div key={index + Math.random()}>{val.component}</div>;
          })}
        </div>
      </BlocksProvider>
    </>
  );
};
