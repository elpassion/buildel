'use client';

import React from 'react';
import { Code } from '@mantine/core';
import { BlockWrapper, useBlocks } from '~/modules/Blocks';
import { useEffectOnce } from '~/utils/hooks';

export const ChatBlock = () => {
  const [{ channel }] = useBlocks();

  // Debugging
  const [data, setData] = React.useState({
    name: 'chat',
    input: 'speech_to_text_output',
    content:
      "You are a helpful assistant. Always answer in not more than 1 sentences! It's very important!",
  });
  const dataCode = `${JSON.stringify(data, null, 2)}`;

  useEffectOnce(() => {
    const res = channel.push('add_block', {
      name: 'chat',
      opts: {
        input: 'speech_to_text_output',
        messages: [
          {
            role: 'system',
            content:
              "You are a helpful assistant. Always answer in not more than 1 sentences! It's very important!",
          },
        ],
      },
      forward_outputs: ['sentences_output'],
    });
    console.log('add_block - chat res');
    console.log(res);

    const listenerCallback = (payload: any) => {
      console.log(payload);
      // dispatch({ type: 'speechToTextOutput', payload: payloadData });
    };
    const listenerID = channel.on('chat_sentences_output', listenerCallback);

    return () => {
      channel.off('chat_sentences_output', listenerID);
    };
  });

  return (
    <BlockWrapper name="Chat">
      <Code block>{dataCode}</Code>
    </BlockWrapper>
  );
};
