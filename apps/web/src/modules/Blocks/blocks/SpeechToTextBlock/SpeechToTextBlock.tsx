'use client';

import React from 'react';
import { Code, Text } from '@mantine/core';
import { BlockWrapper, useBlocks } from '~/modules/Blocks';
import { useEffectOnce } from '~/utils/hooks';

export const SpeechToTextBlock = () => {
  const [{ channel }] = useBlocks();

  // Debugging
  const [input, setInput] = React.useState('audio_input_output');
  const [data, setData] = React.useState({
    name: 'speech_to_text',
    input,
  });
  const dataCode = `${JSON.stringify(data, null, 2)}`;

  useEffectOnce(() => {
    const res = channel.push('add_block', {
      name: 'speech_to_text',
      opts: {
        input: 'audio_input_output',
      },
      forward_outputs: ['output'],
    });
    console.log('add_block - speech_to_text res');
    console.log(res);

    const listenerCallback = (payload: any) => {
      console.log(payload);
      // dispatch({ type: 'speechToTextOutput', payload: payloadData });
    };
    const listenerID = channel.on('speech_to_text_output', listenerCallback);

    return () => {
      channel.off('speech_to_text_output', listenerID);
    };
  });

  return (
    <BlockWrapper name="SpeechToText">
      <Code block>{dataCode}</Code>
    </BlockWrapper>
  );
};
