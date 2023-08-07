'use client';

import { Text } from '@mantine/core';
import { useToggle } from '@mantine/hooks';
import {
  AudioToTextBlock,
  BlocksProvider,
  FileAudioInput,
  TextToAudioBlock,
} from '~/modules/Blocks';

export const UploadAudioClient = () => {
  return (
    <BlocksProvider>
      <Text>Upload audio</Text>

      <div className="mb-4" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <FileAudioInput enabled={true} />
      </div>

      <div className="mb-4" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <AudioToTextBlock enabled={true} />
        <TextToAudioBlock enabled={true} />
      </div>
    </BlocksProvider>
  );
};
