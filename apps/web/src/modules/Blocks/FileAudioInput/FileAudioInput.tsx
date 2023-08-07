'use client';

import React from 'react';
import { FileInput, FileInputProps } from '@mantine/core';
import { BlockBase, BlockWrapper, useBlocks } from '~/modules/Blocks';

interface FileAudioInputProps extends BlockBase {}

export const FileAudioInput = ({ enabled }: FileAudioInputProps) => {
  const [_, dispatch] = useBlocks();

  const handleFileChange = (file: File | null) => {
    if (file) {
      dispatch({ type: 'setAudioFile', audioFile: file });
    }
  };

  return (
    <BlockWrapper enabled={enabled} name="Audio input">
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
