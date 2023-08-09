'use client';

import { Text } from '@mantine/core';
import // AudioToTextBlock,
// FileAudioInput,
// TextToAudioBlock,
'~/modules/Blocks';

export const UploadAudioClient = () => {
  return (
    <>
      <Text>Upload audio</Text>

      <div className="mb-8" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/*<FileAudioInput enabled={true} />*/}
      </div>

      <div className="mb-4" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/*<AudioToTextBlock enabled={true} />*/}
        {/*<TextToAudioBlock enabled={true} />*/}
      </div>
    </>
  );
};
