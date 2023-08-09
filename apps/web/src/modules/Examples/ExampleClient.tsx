'use client';

import React from 'react';
import { Button, Group, Text } from '@mantine/core';
import { Socket } from 'phoenix';
import {
  AudioToTextBlock,
  FileAudioInput,
  TextToAudioBlock,
  ppush,
  useBlocks,
} from '~/modules/Blocks';
import { ChatGPTBlock } from '~/modules/Blocks/ChatGPTBlock';
import { useEffectOnce } from '~/utils/hooks';

interface BlockItem {
  name: string;
  component: any;
}

export const ExampleClient = () => {
  // https://dev.to/shubhamtiwari909/react-hooks-library-mantine-part-1-ck6
  // https://v7.mantine.dev/hooks/use-list-state
  const [blocks, setBlocks] = React.useState<BlockItem[]>([]);

  const [textOutput, setTextOutput] = React.useState<string[]>([]);

  const [state, dispatch] = useBlocks();
  const { socket, channel, speechToTextOutput } = state;

  useEffectOnce(() => {
    console.log({ socket, channel });
  });

  React.useEffect(() => {
    if (speechToTextOutput) {
      console.log(speechToTextOutput);
      setTextOutput((prevState) => [...prevState, speechToTextOutput.message]);
    }
  }, [speechToTextOutput]);

  return (
    <>
      <Text>Select blocks to add</Text>

      <div className="mb-4" />

      <Group>
        <Button
          color="red"
          onClick={() => {
            channel.push('remove_block', { name: 'audio_input' });
            channel.push('remove_block', { name: 'speech_to_text' });
            channel.push('remove_block', { name: 'chat' });
            channel.push('remove_block', { name: 'text_to_speech' });

            setBlocks([]);
            setTextOutput([]);
            // blocksHandlers.setState([]);
            // dispatch({ type: 'setAudioFile', audioFile: null });
          }}
        >
          Reset
        </Button>
        <Button
          onClick={() => {
            console.log('play');
            // console.log({ socket, channel });
          }}
        >
          Play
        </Button>
        <Button
          onClick={() => {
            ppush(channel, 'get_blocks', {}).then(console.log);
          }}
        >
          Get blocks
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

      <div className="mb-4" />

      <div className="border p-4">
        {textOutput.map((text) => (
          <div className="flex" key={Math.random()}>
            {text}
          </div>
        ))}
      </div>
    </>
  );
};
