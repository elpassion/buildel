'use client';

import React from 'react';
import { Text } from '@mantine/core';
import { BlockBase, BlockWrapper, useBlocks } from '~/modules/Blocks';

interface AudioToTextBlockProps extends BlockBase {}

export const AudioToTextBlock = ({ enabled }: AudioToTextBlockProps) => {
  const [state] = useBlocks();
  const { audioFile } = state;

  return (
    <BlockWrapper enabled={enabled} name="Audio to text">
      {audioFile && <Text>Processing: {audioFile.name}</Text>}
      <Text>AudioToTextBlock</Text>
      <Text>Provider: Deepgram</Text>
    </BlockWrapper>
  );
};
