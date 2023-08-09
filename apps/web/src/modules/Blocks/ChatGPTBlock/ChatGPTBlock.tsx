'use client';

import React from 'react';
import { Accordion, Code, Input, Text } from '@mantine/core';
import {
  BlockBase,
  BlockWrapper,
  ChatBlock,
  TextToSpeechBlock,
  useBlocks,
} from '~/modules/Blocks';
import { useEffectOnce } from '~/utils/hooks';

interface ChatGPTBlockProps extends BlockBase {}

export const ChatGPTBlock = ({ enabled }: ChatGPTBlockProps) => {
  const [input, setInput] = React.useState('speech_to_text_output');
  const [context, setContext] = React.useState('');
  const [data, setData] = React.useState({
    name: 'chat',
    type: 'Chat',
    input,
    messages: [{ role: 'system', content: 'message content' }],
  });

  const [state] = useBlocks();
  const { channel, audioFile } = state;

  const dataCode = `${JSON.stringify(data, null, 2)}`;

  useEffectOnce(() => {
    // console.log('add_block, audio_input');
    // ppush(channel, 'get_blocks', {}).then(console.log);
    // console.log(channel);

    const res = channel.push('add_block', {
      name: 'chat',
      opts: {
        input: 'speech_to_text_output',
        messages: [
          {
            role: 'system',
            content: 'you are a pirate',
          },
        ],
      },
      forward_outputs: ['sentences_output'],
    });
    // console.log('add_block - audio_input res');
    console.log(res);

    const listenerOutput = (event: any) => {
      console.log(event);
    };

    const listenerID = channel.on('chat_sentences_output', listenerOutput);

    return () => {
      channel.off('chat_sentences_output', listenerID);
    };
  });

  React.useEffect(() => {
    setData((prevState) => ({ ...prevState, input }));
  }, [input]);
  React.useEffect(() => {
    setData((prevState) => ({
      ...prevState,
      messages: [{ role: 'system', content: context }],
    }));
  }, [context]);

  return (
    <BlockWrapper enabled={enabled} name="Chat">
      <Accordion>
        <Accordion.Item value="cfg">
          <Accordion.Control>Cfg</Accordion.Control>
          <Accordion.Panel>
            <Code block>{dataCode}</Code>
            <div className="mb-2" />
            <Input.Wrapper label="Input">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </Input.Wrapper>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <div className="mb-4" />

      <Input.Wrapper label="Context">
        <Input
          placeholder="Give me some context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
      </Input.Wrapper>
    </BlockWrapper>
  );
};
