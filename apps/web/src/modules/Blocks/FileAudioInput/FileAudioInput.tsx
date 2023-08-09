'use client';

import React from 'react';
import { Accordion, ActionIcon, Code, FileInput } from '@mantine/core';
import { useToggle } from '@mantine/hooks';
import { IconMicrophone, IconMicrophoneOff } from '@tabler/icons-react';
import {
  AudioInputBlock,
  BlockBase,
  BlockWrapper,
  ppush,
  streamMedia,
  useBlocks,
} from '~/modules/Blocks';
import { useEffectOnce } from '~/utils/hooks';

interface FileAudioInputProps extends BlockBase {}

export const FileAudioInput = ({ enabled }: FileAudioInputProps) => {
  const [isMicRecording, toggleMicRecording] = useToggle([false, true]);
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder>();

  const [data, setData] = React.useState<AudioInputBlock>({
    name: 'audio_input',
    type: 'AudioInput',
  });

  const [state, dispatch] = useBlocks();
  const { channel, audioFile } = state;

  const dataCode = `${JSON.stringify(data, null, 2)}`;

  const handleFileChange = (file: File | null) => {
    if (file) {
      dispatch({ type: 'setAudioFile', audioFile: file });
    }
  };

  useEffectOnce(() => {
    // console.log('add_block, audio_input');
    // ppush(channel, 'get_blocks', {}).then(console.log);
    // console.log(channel);

    const res = channel.push('add_block', {
      name: 'audio_input',
      opts: {},
      forward_outputs: [],
    });
    console.log('add_block - audio_input res');
    console.log(res);
  });

  React.useEffect(() => {
    getMediaRecorder().then((recorder) => {
      setMediaRecorder(recorder);
      recorder.stop();
    });
  }, []);

  React.useEffect(() => {
    if (isMicRecording) {
      channel.on('speech_to_text_output', (payload) => {
        const payloadData = {
          message: payload.message.message,
          is_final: payload.message.is_final,
        };
        dispatch({ type: 'speechToTextOutput', payload: payloadData });
      });
    }
  }, [channel, mediaRecorder, isMicRecording]);

  async function getMediaRecorder() {
    const constraints = { audio: true };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const mediaRecorder = new MediaRecorder(stream);
    return mediaRecorder;
  }

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

      <div className="flex flex-col gap-4">
        <ActionIcon
          variant="filled"
          aria-label="Microphone"
          onClick={async () => {
            toggleMicRecording();
            const sm = await streamMedia(channel);
          }}
        >
          {isMicRecording ? <IconMicrophone /> : <IconMicrophoneOff />}
        </ActionIcon>

        <div className="mb-4" />

        <FileInput
          label="Audio input"
          placeholder="Input placeholder"
          accept="audio/*"
          onChange={handleFileChange}
          withAsterisk
        />
      </div>
    </BlockWrapper>
  );
};
