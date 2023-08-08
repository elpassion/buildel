'use client';

import React from 'react';
import { Accordion, Code, Input, Select, Text } from '@mantine/core';
import {
  BlockBase,
  BlockWrapper,
  SpeechToTextBlock,
  useBlocks,
} from '~/modules/Blocks';

const codeForPreviousDemo = `import React from 'react';
import { Code } from '@mantine/core';

function Demo() {
  return <Code>React.createElement()</Code>;
}`;

interface AudioToTextBlockProps extends BlockBase {}

export const AudioToTextBlock = ({ enabled }: AudioToTextBlockProps) => {
  const [input, setInput] = React.useState('audio_input_output');
  const [data, setData] = React.useState({
    name: 'speech_to_text',
    type: 'SpeechToText',
    input,
  });

  const [state] = useBlocks();
  const { audioFile } = state;

  const dataCode = `${JSON.stringify(data, null, 2)}`;

  React.useEffect(() => {
    if (state.audioFile) {
    }
  }, [state.audioFile]);

  React.useEffect(() => {
    setData((prevState) => ({ ...prevState, input }));
  }, [input]);

  return (
    <BlockWrapper enabled={enabled} name="Audio to text">
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
        data={['Deepgram', 'OtherProvider', 'Example']}
        defaultValue="Deepgram"
      />
    </BlockWrapper>
  );
};
