'use client';

import React from 'react';
import { Accordion, Code, FileInput } from '@mantine/core';
import {
  AudioInputBlock,
  BlockBase,
  BlockWrapper,
  useBlocks,
} from '~/modules/Blocks';

interface FileAudioInputProps extends BlockBase {}

export const FileAudioInput = ({ enabled }: FileAudioInputProps) => {
  const [data, setData] = React.useState<AudioInputBlock>({
    name: 'audio_input',
    type: 'AudioInput',
  });

  const [state, dispatch] = useBlocks();
  const { audioFile } = state;

  const dataCode = `${JSON.stringify(data, null, 2)}`;

  const handleFileChange = (file: File | null) => {
    if (file) {
      dispatch({ type: 'setAudioFile', audioFile: file });
    }
  };

  return (
    <BlockWrapper enabled={enabled} name="Audio input">
      <Accordion>
        <Accordion.Item value="cfg">
          <Accordion.Control>Cfg</Accordion.Control>
          <Accordion.Panel>
            <Code block>{dataCode}</Code>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <div className="mb-4" />

      <FileInput
        label="Audio input"
        placeholder="Input placeholder"
        accept="audio/*"
        onChange={handleFileChange}
        withAsterisk
      />
    </BlockWrapper>
  );
};
