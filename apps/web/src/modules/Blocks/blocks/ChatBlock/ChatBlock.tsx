'use client';

import React from 'react';
import { Code, Input } from '@mantine/core';
import { BlockWrapper, useBlocks } from '~/modules/Blocks';
import { useEffectOnce } from '~/utils/hooks';

// TODO (hub33k): edit block data, on focus lost update block - `channel.push('update_block', {name: 'chat})`

export const ChatBlock = () => {
  const [{ channel }] = useBlocks();

  const [content, setContent] = React.useState('You are a helpful assistant.');

  // Debugging
  const [data, setData] = React.useState({
    name: 'chat',
    input: 'speech_to_text_output',
    content,
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
            content,
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

  React.useEffect(() => {
    setData((prevState) => ({
      ...prevState,
      content,
    }));
  }, [content]);

  return (
    <BlockWrapper name="Chat">
      <Code block>{dataCode}</Code>

      <div className="mb-4" />

      <Input.Wrapper label="Context">
        <Input
          placeholder="Give me some context"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={() => {
            // channel.push('update_block', {
            //   name: 'chat',
            //   opts: {
            //     input: 'speech_to_text_output',
            //     messages: [
            //       {
            //         role: 'system',
            //         content,
            //       },
            //     ],
            //   },
            //   forward_outputs: ['sentences_output'],
            // });
          }}
        />
      </Input.Wrapper>
    </BlockWrapper>
  );
};
