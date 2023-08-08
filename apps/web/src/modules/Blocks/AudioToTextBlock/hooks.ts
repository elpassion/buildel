import React from 'react';
import { SpeechToTextBlock } from '~/modules/Blocks';

const useAudioToText = () => {
  const [data, setData] = React.useState<SpeechToTextBlock>({
    name: 'speech_to_text',
    type: 'SpeechToText',
    input: 'audio_input_output',
  });

  return { data, setData };
};
