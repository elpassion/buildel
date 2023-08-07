'use client';

import { Text } from '@mantine/core';
import { BlockBase, BlockWrapper } from '~/modules/Blocks';

interface TextToAudioBlockProps extends BlockBase {}

export const TextToAudioBlock = ({ enabled }: TextToAudioBlockProps) => {
  return (
    <BlockWrapper enabled={enabled} name="Text to audio">
      <Text>TextToAudioBlock</Text>
    </BlockWrapper>
  );
};
