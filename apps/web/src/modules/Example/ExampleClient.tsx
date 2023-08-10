'use client';

import React from 'react';
import { Button, Card, Image, Text } from '@mantine/core';
import {
  AudioInputBlock,
  ChatBlock,
  SpeechToTextBlock,
  TextToSpeechBlock,
  audioInputBlock,
  chatBlock,
  ppush,
  speechToTextBlock,
  textToSpeechBlock,
  useBlocks,
} from '~/modules/Blocks';

export const ExampleClient = () => {
  const [{ channel }] = useBlocks();
  const [blocks, setBlocks] = React.useState<any>([]);

  const blockList = React.useMemo(() => {
    return [
      {
        name: audioInputBlock.name,
        img: 'https://pbblogassets.s3.amazonaws.com/uploads/2015/08/Audio-Waveforms-Featued-Image.jpg',
        data: audioInputBlock,
        Component: AudioInputBlock,
      },
      {
        name: speechToTextBlock.name,
        img: 'https://nordicapis.com/wp-content/uploads/5-Best-Speech-to-Text-APIs-2-e1615383933700-1024x573.png',
        data: speechToTextBlock,
        Component: SpeechToTextBlock,
      },
      {
        name: chatBlock.name,
        img: 'https://images.unsplash.com/photo-1684487747720-1ba29cda82f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80',
        data: chatBlock,
        Component: ChatBlock,
      },
      {
        name: textToSpeechBlock.name,
        img: 'https://uploads-ssl.webflow.com/5f57aae9cf84e83399ba0032/62b264ced6e2c5184b2ce2d4_The%208%20Best%20TTS%20Voice%20Providers.jpg',
        data: textToSpeechBlock,
        Component: TextToSpeechBlock,
      },
    ];
  }, []);

  return (
    <>
      <div className="">
        <div className="flex gap-4">
          <Button
            color="red"
            onClick={() => {
              channel.push('remove_block', { name: 'audio_input' });
              channel.push('remove_block', { name: 'speech_to_text' });
              channel.push('remove_block', { name: 'chat' });
              channel.push('remove_block', { name: 'text_to_speech' });

              channel.push('reset_blocks', {});

              setBlocks([]);
            }}
          >
            Reset
          </Button>
          <Button
            onClick={() => {
              ppush(channel, 'get_blocks', {}).then(console.log);
            }}
          >
            Get blocks
          </Button>
        </div>

        <div className="mb-8" />

        <Text className="text-2xl">Add block</Text>

        <div className="mb-4" />

        <div className="grid cursor-pointer grid-cols-4 gap-4">
          {blockList.map((block) => (
            <Card
              key={block.name}
              shadow="sm"
              padding="sm"
              onClick={() => {
                setBlocks((prevState: any) => [...prevState, block]);
              }}
            >
              <Card.Section>
                <Image src={block.img} h={160} alt="Audio input" />
              </Card.Section>

              <Text fw={500} size="lg" mt="md">
                {block.name.replaceAll('_', ' ').toUpperCase()}
              </Text>
            </Card>
          ))}
        </div>

        <div className="mb-12" />

        <div className="grid grid-cols-4 gap-4">
          {blocks.map((block: (typeof blockList)[number], index: number) => {
            const Comp = block.Component;
            return (
              <div key={`${block.name}-${index}`}>
                <Comp />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
