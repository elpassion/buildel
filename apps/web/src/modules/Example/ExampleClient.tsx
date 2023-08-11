'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@elpassion/taco';
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
            text="Reset"
            onClick={() => {
              channel.push('remove_block', { name: 'audio_input' });
              channel.push('remove_block', { name: 'speech_to_text' });
              channel.push('remove_block', { name: 'chat' });
              channel.push('remove_block', { name: 'text_to_speech' });

              channel.push('reset_blocks', {});

              setBlocks([]);
            }}
          />

          <Button
            text="Get blocks"
            onClick={() => {
              ppush(channel, 'get_blocks', {}).then(console.log);
            }}
          />
        </div>

        <div className="mb-8" />

        <p className="text-2xl">Add block</p>

        <div className="mb-4" />

        <div className="grid cursor-pointer grid-cols-4 gap-4">
          {blockList.map((block) => (
            <div
              key={block.name}
              onClick={() => {
                setBlocks((prevState: any) => [...prevState, block]);
              }}
            >
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.img} height={160} alt="Audio input" />
              </div>

              <p>{block.name.replaceAll('_', ' ').toUpperCase()}</p>
            </div>
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
