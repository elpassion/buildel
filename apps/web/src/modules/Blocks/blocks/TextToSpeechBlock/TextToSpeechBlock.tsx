'use client';

import React from 'react';
import { BlockWrapper, useBlocks } from '~/modules/Blocks';
import { useEffectOnce } from '~/utils/hooks';

export const TextToSpeechBlock = () => {
  const [{ channel }] = useBlocks();

  const isPlaying = React.useRef(false);
  const [audioBuffers, setAudioBuffers] = React.useState<any>([]);

  // Debugging
  const [data, setData] = React.useState({
    name: 'text_to_speech',
    input: 'chat_sentences_output',
  });
  const dataCode = `${JSON.stringify(data, null, 2)}`;

  async function playBuffer() {
    if (isPlaying.current) return;
    if (audioBuffers.length > 0) {
      isPlaying.current = true;
      const ctx = new AudioContext();
      const buffer = audioBuffers.shift();
      const audioBuffer = await ctx.decodeAudioData(buffer);
      const source = ctx.createBufferSource();
      source.addEventListener('ended', () => {
        isPlaying.current = false;
        playBuffer();
      });
      source.connect(ctx.destination);
      source.buffer = audioBuffer;
      source.start();
    } else {
      isPlaying.current = false;
    }
  }

  useEffectOnce(() => {
    const res = channel.push('add_block', {
      name: 'text_to_speech',
      opts: { input: 'chat_sentences_output' },
      forward_outputs: ['output'],
    });
    console.log('add_block - text_to_speech res');
    console.log(res);

    const listenerCallback = (payload: any) => {
      console.log(payload);
      // dispatch({ type: 'speechToTextOutput', payload: payloadData });

      audioBuffers.push(payload);
      playBuffer();
    };
    const listenerID = channel.on('text_to_speech_output', listenerCallback);

    return () => {
      channel.off('text_to_speech_output', listenerID);
    };
  });

  return (
    <BlockWrapper name="TextToSpeech">
      <pre>{dataCode}</pre>
    </BlockWrapper>
  );
};
