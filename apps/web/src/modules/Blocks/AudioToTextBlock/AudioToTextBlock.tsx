'use client';

import React from 'react';
import { Accordion, Code, Input, Select, Text } from '@mantine/core';
import { Channel } from 'phoenix';
import {
  BlockBase,
  BlockWrapper,
  SpeechToTextBlock,
  useBlocks,
} from '~/modules/Blocks';
import { useEffectOnce } from '~/utils/hooks';

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
  const { channel, audioFile } = state;

  const dataCode = `${JSON.stringify(data, null, 2)}`;

  useEffectOnce(() => {
    // console.log('add_block, audio_input');
    // ppush(channel, 'get_blocks', {}).then(console.log);
    // console.log(channel);

    const res = channel.push('add_block', {
      name: 'speech_to_text',
      opts: {
        input: 'audio_input_output',
      },
      forward_outputs: ['output'],
    });
    console.log('add_block - audio_input res');
    console.log(res);

    const listenerOutput = (event: any) => {
      console.log(event);
    };

    const listenerID = channel.on('speech_to_text_output', listenerOutput);

    return () => {
      channel.off('speech_to_text_output', listenerID);
    };
  });

  // function listenForBlockOutputs(
  //   channel: Channel,
  //   block: { name: string; outputName: string },
  // ) {
  //
  //   // block.forwardOutputs.map((output) =>
  //   //   channel.on(`${block.name}_${output}`, () => {}),
  //   // );
  // }

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
