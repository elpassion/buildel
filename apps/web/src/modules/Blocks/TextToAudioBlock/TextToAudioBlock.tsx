'use client';

import React from 'react';
import { Accordion, Code, Input, Select, Text } from '@mantine/core';
import {
  BlockBase,
  BlockWrapper,
  IBlock,
  SpeechToTextBlock,
  TextToSpeechBlock,
  useBlocks,
} from '~/modules/Blocks';

interface TextToAudioBlockProps extends BlockBase {}

export const TextToAudioBlock = ({ enabled }: TextToAudioBlockProps) => {
  const [input, setInput] = React.useState('chat_sentences_output');
  const [data, setData] = React.useState({
    name: 'text_to_speech',
    type: 'TextToSpeech',
    input,
  });

  const [state] = useBlocks();
  const { audioFile } = state;

  const dataCode = `${JSON.stringify(data, null, 2)}`;

  React.useEffect(() => {
    setData((prevState) => ({ ...prevState, input }));
  }, [input]);

  return (
    <BlockWrapper enabled={enabled} name="Text to audio">
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

      <Select
        label="Provider"
        placeholder="Pick provider"
        data={['Elevenlabs', 'OtherProvider', 'Example']}
        defaultValue="Elevenlabs"
      />
      <div className="mb-2" />
      <Select
        label="Voice"
        placeholder="Pick voice"
        data={['male1', 'male2', 'female1', 'female2']}
        defaultValue="male2"
      />
    </BlockWrapper>
  );
};
